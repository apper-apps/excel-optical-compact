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

  async updateLastActive(id) {
    await delay(200);
    const userIndex = users.findIndex(user => user.Id === parseInt(id));
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex] = {
      ...users[userIndex],
      lastActive: new Date().toISOString()
    };
    
    return { ...users[userIndex] };
  }
};