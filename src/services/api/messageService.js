import messagesData from "@/services/mockData/messages.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let messages = [...messagesData];

export const messageService = {
  async getAll() {
    await delay(300);
    return [...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  async create(messageData) {
    await delay(400);
    const newId = Math.max(...messages.map(m => m.Id)) + 1;
    const newMessage = {
      Id: newId,
      ...messageData,
      timestamp: new Date().toISOString(),
      reactions: []
    };
    messages.push(newMessage);
    return { ...newMessage };
  },

  async addReaction(messageId, emoji, userId, userName) {
    await delay(200);
    const messageIndex = messages.findIndex(msg => msg.Id === parseInt(messageId));
    if (messageIndex === -1) throw new Error("Message not found");
    
    const message = messages[messageIndex];
    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
    
    if (reactionIndex === -1) {
      message.reactions.push({
        emoji,
        count: 1,
        users: [userName]
      });
    } else {
      const reaction = message.reactions[reactionIndex];
      if (!reaction.users.includes(userName)) {
        reaction.count++;
        reaction.users.push(userName);
      }
    }
    
    return { ...message };
  },

  async removeReaction(messageId, emoji, userId, userName) {
    await delay(200);
    const messageIndex = messages.findIndex(msg => msg.Id === parseInt(messageId));
    if (messageIndex === -1) throw new Error("Message not found");
    
    const message = messages[messageIndex];
    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
    
    if (reactionIndex !== -1) {
      const reaction = message.reactions[reactionIndex];
      const userIndex = reaction.users.indexOf(userName);
      if (userIndex !== -1) {
        reaction.count--;
        reaction.users.splice(userIndex, 1);
        
        if (reaction.count === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      }
    }
    
    return { ...message };
  }
};