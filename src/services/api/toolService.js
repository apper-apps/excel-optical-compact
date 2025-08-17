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
  }
};