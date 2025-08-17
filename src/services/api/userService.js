import usersData from "@/services/mockData/users.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let users = [...usersData];

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
    // Return Nathan Garrett as current user
    const currentUser = users.find(user => user.Id === 1);
    if (!currentUser) throw new Error("Current user not found");
    return { ...currentUser };
  },

  async create(userData) {
    await delay(400);
    const newId = Math.max(...users.map(u => u.Id), 0) + 1;
    const avatar = userData.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    const newUser = {
      Id: newId,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'user',
      sheetLink: `https://docs.google.com/spreadsheets/d/${userData.name.toLowerCase().replace(' ', '-')}-sheet`,
      lastActive: new Date().toISOString(),
      avatar: avatar
    };
    
    users.push(newUser);
    return { ...newUser };
  },

  async update(id, userData) {
    await delay(300);
    const userIndex = users.findIndex(user => user.Id === parseInt(id));
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      Id: parseInt(id) // Ensure ID doesn't change
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

  async sendInvitation(email, role = 'user') {
    await delay(500);
    // Simulate email invitation
    return {
      success: true,
      message: `Invitation sent to ${email}`,
      invitedAt: new Date().toISOString()
    };
  }
};