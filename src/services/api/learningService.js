import learningPagesData from "@/services/mockData/learningPages.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let learningPages = [...learningPagesData];

export const learningService = {
  async getAll() {
    await delay(400);
    return [...learningPages];
  },

  async getById(id) {
    await delay(300);
    const page = learningPages.find(page => page.Id === parseInt(id));
    if (!page) throw new Error("Learning page not found");
    return { ...page };
  },

  async create(pageData) {
    await delay(500);
    const newId = Math.max(...learningPages.map(p => p.Id)) + 1;
    const newPage = {
      Id: newId,
      ...pageData,
      lastUpdated: new Date().toISOString()
    };
    learningPages.push(newPage);
    return { ...newPage };
  },

  async update(id, pageData) {
    await delay(500);
    const pageIndex = learningPages.findIndex(page => page.Id === parseInt(id));
    if (pageIndex === -1) throw new Error("Learning page not found");
    
    learningPages[pageIndex] = {
      ...learningPages[pageIndex],
      ...pageData,
      lastUpdated: new Date().toISOString()
    };
    
    return { ...learningPages[pageIndex] };
  },

  async delete(id) {
    await delay(300);
    const pageIndex = learningPages.findIndex(page => page.Id === parseInt(id));
    if (pageIndex === -1) throw new Error("Learning page not found");
    
    learningPages.splice(pageIndex, 1);
    return true;
  }
};