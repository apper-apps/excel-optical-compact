import usersData from "@/services/mockData/users.json";
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Add lastActive dates to existing users that don't have them
let users = usersData.map(user => ({
  ...user,
  name: user.user_name_c || user.Name,
  email: user.email || `${user.user_name_c?.toLowerCase().replace(' ', '.')}@company.com`,
  role: user.role || 'user',
  avatar: user.avatar || user.user_name_c?.split(' ').map(n => n[0]).join('').toUpperCase(),
  lastActive: user.lastActive || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  sheetLink: user.sheetLink || '#'
}));

export const userService = {
  async getAll() {
    await delay(300);
    return [...users];
  },

  async getById(id) {
    await delay(200);
    const user = users.find(user => user.Id === parseInt(id));
    if (!user) throw new Error("User not found");
    return { ...user };
  },

  async getCurrentUser() {
    await delay(200);
    // Return first user as current user
    const currentUser = users[0];
    if (!currentUser) throw new Error("Current user not found");
    return { ...currentUser };
  },

async create(userData) {
    await delay(400);
    const newId = Math.max(...users.map(u => u.Id), 0) + 1;
    const avatar = userData.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    const newUser = {
      Id: newId,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'user',
      avatar: avatar,
      lastActive: new Date().toISOString(),
      sheetLink: `https://docs.google.com/spreadsheets/d/${userData.name.toLowerCase().replace(' ', '-')}-sheet`
    };
    
    users.push(newUser);
    return { ...newUser };
  },

  async sendInvitation(email, role) {
    await delay(500);
    
    // Simulate email invitation process
    const isEmailValid = email && email.includes('@');
    if (!isEmailValid) {
      throw new Error("Invalid email address");
    }
    
    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error("Failed to send invitation email. Please try again.");
    }
    
    return {
      success: true,
      message: `Invitation sent to ${email} with ${role} role`,
      sentAt: new Date().toISOString()
    };
  },

async update(id, userData) {
    await delay(300);
    const userIndex = users.findIndex(user => user.Id === parseInt(id));
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      Id: parseInt(id), // Ensure ID doesn't change
      lastActive: new Date().toISOString()
    };
    
    return { ...users[userIndex] };
  },

  async delete(id) {
    await delay(300);
    const userIndex = users.findIndex(user => user.Id === parseInt(id));
    if (userIndex === -1) throw new Error("User not found");
    
    const deletedUser = { ...users[userIndex] };
    users.splice(userIndex, 1);
    return deletedUser;
  },

async updateLastActive(id) {
    await delay(200);
    const userIndex = users.findIndex(user => user.Id === parseInt(id));
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex] = {
      ...users[userIndex],
      lastActive: new Date().toISOString()
    };
    
    return { ...users[userIndex] };
  },

  async updateApiKey(userId, apiKey) {
    await delay(300);
    const userIndex = users.findIndex(user => user.Id === parseInt(userId));
    if (userIndex === -1) throw new Error("User not found");

    users[userIndex] = {
      ...users[userIndex],
      straicoApiKey: apiKey
    };

    return { ...users[userIndex] };
  },

  async getApiKey(userId) {
    await delay(200);
    const user = users.find(user => user.Id === parseInt(userId));
    if (!user) throw new Error("User not found");
    return user.straicoApiKey || null;
  },

  async validateApiKey(apiKey) {
    await delay(500);
    // Simulate API key validation
    if (!apiKey || apiKey.length < 20) {
      throw new Error("Invalid API key format");
    }
    return {
      valid: true,
      message: "API key validated successfully"
    };
  }
};