import winsData from "@/services/mockData/wins.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let wins = [...winsData];

export const winService = {
  async getAll() {
    await delay(350);
    return [...wins].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getById(id) {
    await delay(200);
    const win = wins.find(win => win.Id === parseInt(id));
    if (!win) throw new Error("Win not found");
return { ...win };
  },

  async getRecent() {
    await delay(300);
    return [...wins]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  },
  async create(winData) {
    await delay(450);
    const newId = Math.max(...wins.map(w => w.Id)) + 1;
    const newWin = {
      Id: newId,
      ...winData,
      timestamp: new Date().toISOString(),
      awards: []
    };
    wins.push(newWin);
    return { ...newWin };
  },

  async addAward(winId, awardData) {
    await delay(300);
    const winIndex = wins.findIndex(win => win.Id === parseInt(winId));
    if (winIndex === -1) throw new Error("Win not found");
    
    wins[winIndex].awards.push({
      ...awardData,
      timestamp: new Date().toISOString()
    });
    
    return { ...wins[winIndex] };
  },

  async delete(id) {
    await delay(300);
    const winIndex = wins.findIndex(win => win.Id === parseInt(id));
    if (winIndex === -1) throw new Error("Win not found");
    
    wins.splice(winIndex, 1);
    return true;
  }
};