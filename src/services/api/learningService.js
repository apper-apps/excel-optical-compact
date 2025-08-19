import learningPagesData from "@/services/mockData/learningPages.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Transform raw learning page data to match component expectations
const transformLearningPageData = (rawPage) => {
  const transformed = { ...rawPage };
  
  // Parse video_links_c JSON string to videoLinks array
  if (rawPage.video_links_c) {
    try {
      transformed.videoLinks = JSON.parse(rawPage.video_links_c);
    } catch (e) {
      transformed.videoLinks = [];
    }
  } else {
    transformed.videoLinks = [];
  }
  
  // Parse resources_c JSON string to resources array
  if (rawPage.resources_c) {
    try {
      transformed.resources = JSON.parse(rawPage.resources_c);
    } catch (e) {
      transformed.resources = [];
    }
  } else {
    transformed.resources = [];
  }
  
  return transformed;
};

let learningPages = [...learningPagesData];

export const learningService = {
async getAll() {
    await delay(400);
    return learningPages.map(page => transformLearningPageData({ ...page }));
  },

async getById(id) {
    await delay(300);
    const page = learningPages.find(page => page.Id === parseInt(id));
    if (!page) throw new Error("Learning hub item not found");
    return transformLearningPageData({ ...page });
  },

async create(pageData) {
    await delay(500);
    const newId = learningPages.length > 0 ? Math.max(...learningPages.map(p => p.Id)) + 1 : 1;
    const newPage = {
      Id: newId,
      ...pageData,
      last_updated_c: new Date().toISOString()
    };
    learningPages.push(newPage);
    return transformLearningPageData({ ...newPage });
  },

async update(id, pageData) {
    await delay(500);
    const pageIndex = learningPages.findIndex(page => page.Id === parseInt(id));
    if (pageIndex === -1) throw new Error("Learning hub item not found");
    
    learningPages[pageIndex] = {
      ...learningPages[pageIndex],
      ...pageData,
      last_updated_c: new Date().toISOString()
    };
    
    return transformLearningPageData({ ...learningPages[pageIndex] });
  },

async delete(id) {
    await delay(300);
    const pageIndex = learningPages.findIndex(page => page.Id === parseInt(id));
    if (pageIndex === -1) throw new Error("Learning hub item not found");
    
    learningPages.splice(pageIndex, 1);
    return true;
  },

  // Upload video to a learning page
uploadVideo: async (pageId, videoData) => {
    await delay(1000); // Simulate API delay
    
    const pageIndex = learningPages.findIndex(page => page.Id === pageId);
    if (pageIndex === -1) {
      throw new Error('Learning hub item not found');
    }

    // Ensure the page has a videoLinks array structure for uploads
    const transformedPage = transformLearningPageData(learningPages[pageIndex]);
    if (!transformedPage.videoLinks) {
      transformedPage.videoLinks = [];
    }

    const newVideo = {
      title: videoData.title,
      url: videoData.url,
      duration: videoData.duration,
      description: videoData.description || '',
      uploadDate: videoData.uploadDate
    };

    transformedPage.videoLinks.push(newVideo);
    
    // Update the raw data with the new video as JSON string
    const updatedVideoLinks = JSON.stringify(transformedPage.videoLinks);
    learningPages[pageIndex].video_links_c = updatedVideoLinks;
    learningPages[pageIndex].last_updated_c = new Date().toISOString();

    return newVideo;
  }
};