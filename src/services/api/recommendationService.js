import recommendationsData from "@/services/mockData/recommendations.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let recommendations = [...recommendationsData];

export const recommendationService = {
  async getAll() {
    await delay(350);
    return [...recommendations].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getById(id) {
    await delay(200);
    const recommendation = recommendations.find(rec => rec.Id === parseInt(id));
    if (!recommendation) throw new Error("Recommendation not found");
    return { ...recommendation };
  },

  async create(recommendationData) {
    await delay(450);
    const newId = Math.max(...recommendations.map(r => r.Id)) + 1;
    const newRecommendation = {
      Id: newId,
      ...recommendationData,
      timestamp: new Date().toISOString(),
      votes: [],
      upvotes: 0,
      downvotes: 0,
      comments: [],
      status: "open"
    };
    recommendations.push(newRecommendation);
    return { ...newRecommendation };
  },

  async addVote(recommendationId, userId, userName, voteType) {
    await delay(300);
    const recIndex = recommendations.findIndex(rec => rec.Id === parseInt(recommendationId));
    if (recIndex === -1) throw new Error("Recommendation not found");
    
    const recommendation = recommendations[recIndex];
    
    // Remove existing vote from this user
    recommendation.votes = recommendation.votes.filter(vote => vote.userId !== userId);
    
    // Add new vote
    recommendation.votes.push({
      userId,
      userName,
      type: voteType
    });
    
    // Recalculate vote counts
    recommendation.upvotes = recommendation.votes.filter(v => v.type === "up").length;
    recommendation.downvotes = recommendation.votes.filter(v => v.type === "down").length;
    
    return { ...recommendation };
  },

  async addComment(recommendationId, commentData) {
    await delay(350);
    const recIndex = recommendations.findIndex(rec => rec.Id === parseInt(recommendationId));
    if (recIndex === -1) throw new Error("Recommendation not found");
    
    recommendations[recIndex].comments.push({
      ...commentData,
      timestamp: new Date().toISOString()
    });
    
    return { ...recommendations[recIndex] };
  },

  async updateStatus(id, status) {
    await delay(300);
    const recIndex = recommendations.findIndex(rec => rec.Id === parseInt(id));
    if (recIndex === -1) throw new Error("Recommendation not found");
    
    recommendations[recIndex].status = status;
    return { ...recommendations[recIndex] };
  }
};