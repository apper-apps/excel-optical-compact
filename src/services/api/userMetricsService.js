const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const userMetricsService = {
  async getAll() {
    await delay(400);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "user_name_c" } },
          { field: { Name: "account_c" } },
          { field: { Name: "optimization_score_c" } },
          { field: { Name: "direct_manager_c" } },
          { field: { Name: "account_type_c" } },
          { field: { Name: "clicks_c" } },
          { field: { Name: "impressions_c" } },
          { field: { Name: "ctr_c" } },
          { field: { Name: "avg_cpc_c" } },
          { field: { Name: "cost_c" } },
          { field: { Name: "conversions_c" } },
          { field: { Name: "conversion_rate_c" } },
          { field: { Name: "account_labels_c" } },
          { field: { Name: "all_conversions_c" } },
          { field: { Name: "cost_per_all_conversion_c" } },
          { field: { Name: "all_conversion_rate_c" } },
          { field: { Name: "cost_per_conversion_c" } },
          { field: { Name: "user_id_c" } }
        ]
      };

      const response = await apperClient.fetchRecords('user_metric_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching user metrics:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getByUserId(userId) {
    await delay(300);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "user_name_c" } },
          { field: { Name: "account_c" } },
          { field: { Name: "optimization_score_c" } },
          { field: { Name: "direct_manager_c" } },
          { field: { Name: "account_type_c" } },
          { field: { Name: "clicks_c" } },
          { field: { Name: "impressions_c" } },
          { field: { Name: "ctr_c" } },
          { field: { Name: "avg_cpc_c" } },
          { field: { Name: "cost_c" } },
          { field: { Name: "conversions_c" } },
          { field: { Name: "conversion_rate_c" } },
          { field: { Name: "user_id_c" } }
        ],
        where: [
          { FieldName: "user_id_c", Operator: "EqualTo", Values: [parseInt(userId)] }
        ]
      };

      const response = await apperClient.fetchRecords('user_metric_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("User metrics not found");
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("User metrics not found");
      }

      return response.data[0];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching user metrics by ID:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async updateMetrics(userId, metricsData) {
    await delay(500);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // First get the record ID
      const getParams = {
        fields: [{ field: { Name: "Name" } }],
        where: [
          { FieldName: "user_id_c", Operator: "EqualTo", Values: [parseInt(userId)] }
        ]
      };

      const getResponse = await apperClient.fetchRecords('user_metric_c', getParams);
      
      if (!getResponse.success || !getResponse.data || getResponse.data.length === 0) {
        throw new Error("User metrics not found");
      }

      const recordId = getResponse.data[0].Id;

      const updateParams = {
        records: [{
          Id: recordId,
          ...metricsData
        }]
      };

      const response = await apperClient.updateRecord('user_metric_c', updateParams);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      return response.results?.[0]?.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating user metrics:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
};