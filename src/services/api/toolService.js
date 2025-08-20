import toolsData from "@/services/mockData/tools.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let tools = [...toolsData];

export const toolService = {
  async getAll() {
    await delay(300);
    return [...tools];
  },

  async getById(id) {
    await delay(200);
    const tool = tools.find(tool => tool.Id === parseInt(id));
    if (!tool) throw new Error("Tool not found");
    return { ...tool };
  },

  async create(toolData) {
    await delay(400);
    const newId = Math.max(...tools.map(t => t.Id)) + 1;
    const newTool = {
      Id: newId,
      ...toolData
    };
    tools.push(newTool);
    return { ...newTool };
  },

  async update(id, toolData) {
    await delay(400);
    const toolIndex = tools.findIndex(tool => tool.Id === parseInt(id));
    if (toolIndex === -1) throw new Error("Tool not found");
    
    tools[toolIndex] = {
      ...tools[toolIndex],
      ...toolData
    };
    
    return { ...tools[toolIndex] };
  },

  async delete(id) {
    await delay(300);
    const toolIndex = tools.findIndex(tool => tool.Id === parseInt(id));
    if (toolIndex === -1) throw new Error("Tool not found");
    
    tools.splice(toolIndex, 1);
    return true;
  },

async requestAccess(toolId, userEmail) {
    await delay(400);
    // In a real app, this would send an email
    console.log(`Access request sent for tool ${toolId} from ${userEmail} to nathan.garrett@autoshopsolutions.com`);
    return { success: true, message: "Access request sent successfully" };
  },

  async voteForTool(toolId, voteType) {
    await delay(300);
    const toolIndex = tools.findIndex(tool => tool.Id === parseInt(toolId));
    if (toolIndex === -1) throw new Error("Tool not found");
    
    // Initialize vote counts if they don't exist
    if (!tools[toolIndex].likes) tools[toolIndex].likes = 0;
    if (!tools[toolIndex].dislikes) tools[toolIndex].dislikes = 0;
    
    // Increment the appropriate vote count
    if (voteType === 'like') {
      tools[toolIndex].likes += 1;
    } else if (voteType === 'dislike') {
      tools[toolIndex].dislikes += 1;
    }
    
    return { ...tools[toolIndex] };
  },

  async suggestTool(toolData) {
    await delay(400);
    // In a real app, this would store the suggestion in a database and notify admins
    console.log('Tool suggestion received:', {
      ...toolData,
      suggestedAt: new Date().toISOString(),
      status: 'pending'
    });
    return { success: true, message: "Tool suggestion submitted successfully" };
  }
};