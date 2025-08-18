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
    
    // Enhanced email validation for invitation system
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error("Please provide a valid email address for the invitation");
    }

    if (!role || !['admin', 'user', 'moderator'].includes(role.toLowerCase())) {
      throw new Error("Please specify a valid role (admin, user, or moderator) for the invitation");
    }

    try {
      // Initialize ApperClient with enhanced error handling
      const { ApperClient } = window.ApperSDK;
      if (!ApperClient) {
        throw new Error("ApperSDK not available. Please refresh the page and try again.");
      }

      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Validate environment variables
      if (!import.meta.env.VITE_APPER_PROJECT_ID || !import.meta.env.VITE_APPER_PUBLIC_KEY) {
        throw new Error("Authentication configuration missing. Please contact system administrator.");
      }

      // Create email invitation record in database with enhanced data
      const invitationData = {
        records: [{
          recipient_email_c: email.toLowerCase().trim(),
          invitation_role_c: role.toLowerCase(),
          sent_at_c: new Date().toISOString(),
          status_c: 'pending',
          invitation_type_c: 'user_invite',
          expires_at_c: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiry
          created_by_c: 'system'
        }]
      };

      console.log('Sending invitation email to:', email, 'with role:', role);
      const response = await apperClient.createRecord('email_invitation_c', invitationData);

      // Enhanced response validation
      if (!response || !response.success) {
        const errorMsg = response?.message || 'Unknown error occurred while sending invitation';
        console.error('Invitation API error:', errorMsg);
        throw new Error(`Failed to send invitation email: ${errorMsg}`);
      }

      // Validate response data
      const invitationId = response.results?.[0]?.data?.Id;
      if (!invitationId) {
        console.warn('Invitation sent but no ID returned:', response);
      }

      console.log('Invitation sent successfully:', {
        email,
        role,
        invitationId,
        sentAt: new Date().toISOString()
      });

      return {
        success: true,
        message: `Password setup invitation sent to ${email} with ${role} role. The invitation will expire in 7 days.`,
        sentAt: new Date().toISOString(),
        invitationId: invitationId || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      // Enhanced error logging and handling
      const errorMessage = error.message || 'Unknown error occurred';
      console.error('Error in sendInvitation:', {
        email,
        role,
        error: errorMessage,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      // Provide user-friendly error messages based on error type
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        throw new Error('Network error: Please check your internet connection and try again.');
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
        throw new Error('Authentication error: Please log out and log back in, then try again.');
      } else if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        throw new Error(`An invitation has already been sent to ${email}. Please check if they received it.`);
      } else {
        throw new Error(`Failed to send password setup invitation: ${errorMessage}`);
      }
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