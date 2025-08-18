const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const messageService = {
  async getAll() {
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
          { field: { Name: "user_avatar_c" } },
          { field: { Name: "content_c" } },
          { field: { Name: "attachments_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "reactions_c" } },
          { field: { Name: "user_id_c" } }
        ],
        orderBy: [
          { fieldName: "timestamp_c", sorttype: "ASC" }
        ]
      };

      const response = await apperClient.fetchRecords('message_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

// Transform response data to match UI expectations
      const transformedData = (response.data || []).map(msg => ({
        ...msg,
        // Ensure consistent field names for UI compatibility
        userName: msg.user_name_c || msg.userName,
        userAvatar: msg.user_avatar_c || msg.userAvatar,
        content: msg.content_c || msg.content,
        timestamp: msg.timestamp_c || msg.timestamp,
        userId: msg.user_id_c || msg.userId,
        // Parse reactions if they exist
        reactions: msg.reactions_c ? (() => {
          try {
            return JSON.parse(msg.reactions_c);
          } catch (e) {
            return [];
          }
        })() : (msg.reactions || [])
      }));
      
      return transformedData;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching messages:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getRecent() {
    await delay(200);
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
          { field: { Name: "user_avatar_c" } },
          { field: { Name: "content_c" } },
          { field: { Name: "timestamp_c" } }
        ],
        orderBy: [
          { fieldName: "timestamp_c", sorttype: "DESC" }
        ],
        pagingInfo: { limit: 5, offset: 0 }
      };

      const response = await apperClient.fetchRecords('message_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching recent messages:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async create(messageData) {
    await delay(400);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: messageData.content_c?.substring(0, 50) || "Message",
          user_name_c: messageData.user_name_c,
          user_avatar_c: messageData.user_avatar_c,
          content_c: messageData.content_c,
          attachments_c: messageData.attachments_c ? JSON.stringify(messageData.attachments_c) : "",
          timestamp_c: new Date().toISOString(),
          reactions_c: "",
          user_id_c: messageData.user_id_c
        }]
      };

      const response = await apperClient.createRecord('message_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create message ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
}
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating message:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(messageId, updateData) {
    await delay(300);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(messageId),
          ...updateData
        }]
      };

      const response = await apperClient.updateRecord('message_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update message ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating message:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async delete(messageId) {
    await delay(300);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(messageId)]
      };

      const response = await apperClient.deleteRecord('message_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete message ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        }
        
        return successfulDeletions.length > 0;
      }
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating message:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async addReaction(messageId, emoji, userId, userName) {
    await delay(200);
    try {
      // Get current message
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const getParams = {
        fields: [
          { field: { Name: "reactions_c" } }
        ]
      };

      const getResponse = await apperClient.getRecordById('message_c', parseInt(messageId), getParams);
      
      if (!getResponse.success) {
        throw new Error("Message not found");
      }

      // Parse existing reactions
      let reactions = [];
      if (getResponse.data.reactions_c) {
        try {
          reactions = JSON.parse(getResponse.data.reactions_c);
        } catch (e) {
          reactions = [];
        }
      }

      // Add or update reaction
      const reactionIndex = reactions.findIndex(r => r.emoji === emoji);
      if (reactionIndex === -1) {
        reactions.push({
          emoji,
          count: 1,
          users: [userName]
        });
      } else {
        const reaction = reactions[reactionIndex];
        if (!reaction.users.includes(userName)) {
          reaction.count++;
          reaction.users.push(userName);
        }
      }

      // Update message
      const updateParams = {
        records: [{
          Id: parseInt(messageId),
          reactions_c: JSON.stringify(reactions)
        }]
      };

      const updateResponse = await apperClient.updateRecord('message_c', updateParams);
      
      if (!updateResponse.success) {
        throw new Error(updateResponse.message);
      }

      return updateResponse.results?.[0]?.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error adding reaction:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
}
  }
};