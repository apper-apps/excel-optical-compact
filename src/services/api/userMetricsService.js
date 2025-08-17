import userMetricsData from "@/services/mockData/userMetrics.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let userMetrics = [...userMetricsData];

export const userMetricsService = {
  async getAll() {
    await delay(400);
    return [...userMetrics];
  },

  async getByUserId(userId) {
    await delay(300);
    const metrics = userMetrics.find(metric => metric.userId === parseInt(userId));
    if (!metrics) throw new Error("User metrics not found");
    return { ...metrics };
  },

  async getAccountMetrics(account) {
    await delay(300);
    const metrics = userMetrics.find(metric => metric.account === account);
    if (!metrics) throw new Error("Account metrics not found");
    return { ...metrics };
  },

  async updateMetrics(userId, metricsData) {
    await delay(500);
    const metricsIndex = userMetrics.findIndex(metric => metric.userId === parseInt(userId));
    if (metricsIndex === -1) throw new Error("User metrics not found");
    
    userMetrics[metricsIndex] = {
      ...userMetrics[metricsIndex],
      ...metricsData
    };
    
    return { ...userMetrics[metricsIndex] };
  }
};