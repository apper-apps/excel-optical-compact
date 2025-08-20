import scriptsData from "@/services/mockData/scripts.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let scripts = [...scriptsData];

export const scriptService = {
  async getAll() {
    await delay(350);
    return [...scripts];
  },

  async getById(id) {
    await delay(200);
const script = scripts.find(script => script.Id === parseInt(id));
    if (!script) throw new Error("Script not found");
    return { ...script };
  },

  async getByCategory(category) {
    await delay(300);
    return scripts.filter(script => 
      script.category.toLowerCase() === category.toLowerCase()
    ).map(script => ({ ...script }));
  },

  async create(scriptData) {
    await delay(450);
const newId = scripts.length > 0 ? Math.max(...scripts.map(s => s.Id)) + 1 : 1;
    const newScript = {
      Id: newId,
      ...scriptData
    };
    scripts.push(newScript);
    return { ...newScript };
  },

  async update(id, scriptData) {
    await delay(450);
const scriptIndex = scripts.findIndex(script => script.Id === parseInt(id));
    if (scriptIndex === -1) throw new Error("Script not found");
    
    scripts[scriptIndex] = {
      ...scripts[scriptIndex],
      ...scriptData
    };
    
    return { ...scripts[scriptIndex] };
  },

  async delete(id) {
await delay(500);
    const scriptIndex = scripts.findIndex(script => script.Id === parseInt(id));
    if (scriptIndex === -1) throw new Error("Script not found");
    
    scripts.splice(scriptIndex, 1);
    return true;
  }
};