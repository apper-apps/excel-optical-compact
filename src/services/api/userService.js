import usersData from "@/services/mockData/users.json";
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get deleted user IDs from localStorage
const getDeletedUserIds = () => {
  try {
    const deletedIds = localStorage.getItem('deletedUserIds');
    return deletedIds ? JSON.parse(deletedIds) : [];
  } catch (error) {
    return [];
  }
};

// Filter out deleted users and add lastActive dates to existing users
let users = usersData
  .filter(user => !getDeletedUserIds().includes(user.Id))
  .map(user => ({
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
    
    // Validate email format
    const isEmailValid = email && email.includes('@');
    if (!isEmailValid) {
      throw new Error("Invalid email address");
    }

    try {
      // Initialize ApperClient for email invitation
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Create email invitation record in database
      const invitationData = {
        records: [{
          recipient_email_c: email,
          invitation_role_c: role,
          sent_at_c: new Date().toISOString(),
          status_c: 'pending',
          invitation_type_c: 'user_invite'
        }]
      };

      const response = await apperClient.createRecord('email_invitation_c', invitationData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to send invitation email');
      }

      return {
        success: true,
        message: `Invitation sent to ${email} with ${role} role`,
        sentAt: new Date().toISOString(),
        invitationId: response.results?.[0]?.data?.Id
      };
    } catch (error) {
      console.error('Error sending email invitation:', error.message);
      throw new Error(`Failed to send invitation email: ${error.message}`);
    }
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
    
    // Permanently track deleted user ID in localStorage
    const deletedIds = getDeletedUserIds();
    const userId = parseInt(id);
    if (!deletedIds.includes(userId)) {
      deletedIds.push(userId);
      localStorage.setItem('deletedUserIds', JSON.stringify(deletedIds));
    }
    
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