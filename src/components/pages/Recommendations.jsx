import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import TextArea from "@/components/atoms/TextArea";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { recommendationService } from "@/services/api/recommendationService";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddRecommendation, setShowAddRecommendation] = useState(false);
  const [newRecommendation, setNewRecommendation] = useState({
    title: "",
    description: "",
    category: "Process Improvement"
  });
  const [saving, setSaving] = useState(false);
  const [voting, setVoting] = useState(null);

  const currentUser = {
    Id: 1,
    name: "Nathan Garrett",
    avatar: "NG"
  };

  const categories = [
    "Process Improvement",
    "Tools & Technology", 
    "Training & Development"
  ];

  const statuses = [
    { key: "all", label: "All", color: "default" },
    { key: "open", label: "Open", color: "secondary" },
    { key: "under-review", label: "Under Review", color: "warning" },
    { key: "implemented", label: "Implemented", color: "primary" }
  ];

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    filterRecommendations();
  }, [recommendations, selectedStatus, selectedCategory]);

  const loadRecommendations = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await recommendationService.getAll();
      setRecommendations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterRecommendations = () => {
    let filtered = recommendations;

    if (selectedStatus !== "all") {
      filtered = filtered.filter(rec => rec.status === selectedStatus);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(rec => rec.category === selectedCategory);
    }

    setFilteredRecommendations(filtered);
  };

  const handleAddRecommendation = async () => {
    if (!newRecommendation.title.trim() || !newRecommendation.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSaving(true);
      const recommendationData = {
        ...newRecommendation,
        userId: currentUser.Id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar
      };

      const created = await recommendationService.create(recommendationData);
      setRecommendations([created, ...recommendations]);
      setNewRecommendation({ title: "", description: "", category: "Process Improvement" });
      setShowAddRecommendation(false);
      toast.success("Recommendation submitted successfully!");
    } catch (err) {
      toast.error("Failed to submit recommendation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleVote = async (recommendationId, voteType) => {
    try {
      setVoting(recommendationId);
      await recommendationService.addVote(recommendationId, currentUser.Id, currentUser.name, voteType);
      await loadRecommendations(); // Reload to get updated votes
      toast.success(`Vote ${voteType === 'up' ? 'added' : 'recorded'}!`);
    } catch (err) {
      toast.error("Failed to vote");
    } finally {
      setVoting(null);
    }
  };

  const getUserVote = (recommendation) => {
    return recommendation.votes.find(vote => vote.userId === currentUser.Id);
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadgeVariant = (status) => {
    const statusConfig = statuses.find(s => s.key === status);
    return statusConfig?.color || "default";
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadRecommendations} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 font-display">Team Recommendations 💡</h1>
              <p className="text-purple-100">Share ideas and vote on improvements</p>
            </div>
            <div className="hidden md:block">
              <ApperIcon name="Lightbulb" size={48} className="text-purple-200" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <Button
                  key={status.key}
                  variant={selectedStatus === status.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status.key)}
                >
                  {status.label}
                </Button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={() => setShowAddRecommendation(true)}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            New Idea
          </Button>
        </div>
      </Card>

      {/* Recommendations List */}
      {filteredRecommendations.length === 0 ? (
        <Empty 
          title="No recommendations found" 
          description="Be the first to suggest an improvement for the team!"
          icon="Lightbulb"
          action={() => setShowAddRecommendation(true)}
          actionLabel="Share an Idea"
        />
      ) : (
        <div className="space-y-6">
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start space-x-4">
                  {/* Voting Section */}
                  <div className="flex flex-col items-center space-y-2 mr-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(recommendation.Id, "up")}
                      disabled={voting === recommendation.Id}
                      className={`p-2 ${
                        getUserVote(recommendation)?.type === "up" 
                          ? "text-secondary bg-secondary/10" 
                          : "text-gray-400 hover:text-secondary"
                      }`}
                    >
                      <ApperIcon name="ChevronUp" className="w-5 h-5" />
                    </Button>
                    
                    <span className="font-semibold text-lg text-gray-900">
                      {recommendation.upvotes - recommendation.downvotes}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(recommendation.Id, "down")}
                      disabled={voting === recommendation.Id}
                      className={`p-2 ${
                        getUserVote(recommendation)?.type === "down" 
                          ? "text-accent bg-accent/10" 
                          : "text-gray-400 hover:text-accent"
                      }`}
                    >
                      <ApperIcon name="ChevronDown" className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {recommendation.userAvatar}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{recommendation.userName}</p>
                          <p className="text-sm text-gray-500">{formatTimeAgo(recommendation.timestamp)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {recommendation.category}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(recommendation.status)}>
                          {recommendation.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3 font-display">
                      {recommendation.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {recommendation.description}
                    </p>

                    {/* Comments */}
                    {recommendation.comments && recommendation.comments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Comments</h4>
                        <div className="space-y-3">
                          {recommendation.comments.map((comment, idx) => (
                            <div key={idx} className="flex items-start space-x-3 bg-gray-50 rounded-lg p-3">
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-semibold">
                                  {comment.userName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="text-sm font-medium text-gray-900">{comment.userName}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatTimeAgo(comment.timestamp)}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Recommendation Modal */}
      {showAddRecommendation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddRecommendation(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-full max-w-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold font-display">Share Your Idea 💡</h3>
              <button
                onClick={() => setShowAddRecommendation(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newRecommendation.category}
                  onChange={(e) => setNewRecommendation({...newRecommendation, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendation Title
                </label>
                <Input
                  value={newRecommendation.title}
                  onChange={(e) => setNewRecommendation({...newRecommendation, title: e.target.value})}
                  placeholder="What's your suggestion?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <TextArea
                  value={newRecommendation.description}
                  onChange={(e) => setNewRecommendation({...newRecommendation, description: e.target.value})}
                  placeholder="Describe your recommendation in detail..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddRecommendation}
                  disabled={!newRecommendation.title.trim() || !newRecommendation.description.trim() || saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Send" className="w-4 h-4 mr-2" />
                      Submit Idea
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowAddRecommendation(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Recommendations;