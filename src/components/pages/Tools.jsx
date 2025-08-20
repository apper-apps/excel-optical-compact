import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { toolService } from "@/services/api/toolService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const Tools = () => {
const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestingAccess, setRequestingAccess] = useState(null);
  const [voting, setVoting] = useState(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [toolSuggestion, setToolSuggestion] = useState({
    name: '',
    description: '',
    url: '',
    category: ''
  });
  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [tools, selectedCategory, searchTerm]);

  const loadTools = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await toolService.getAll();
      setTools(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterTools = () => {
    let filtered = tools;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTools(filtered);
  };

  const handleRequestAccess = async (tool) => {
    try {
      setRequestingAccess(tool.Id);
      await toolService.requestAccess(tool.Id, "current.user@autoshopsolutions.com");
      toast.success(`Access request sent for ${tool.name}! Nathan will review your request.`);
    } catch (err) {
      toast.error("Failed to send access request. Please try again.");
    } finally {
      setRequestingAccess(null);
    }
  };

const handleVote = async (tool, voteType) => {
    try {
      setVoting(tool.Id);
      const updatedTool = await toolService.voteForTool(tool.Id, voteType);
      setTools(prev => prev.map(t => t.Id === tool.Id ? updatedTool : t));
      toast.success(`Vote recorded for ${tool.Name}!`);
    } catch (err) {
      toast.error("Failed to record vote. Please try again.");
    } finally {
      setVoting(null);
    }
  };

  const handleSuggestTool = async (e) => {
    e.preventDefault();
    if (!toolSuggestion.name || !toolSuggestion.url) {
      toast.error("Please fill in tool name and URL");
      return;
    }

    try {
      await toolService.suggestTool(toolSuggestion);
      toast.success("Tool suggestion submitted! Admin will review it shortly.");
      setToolSuggestion({ name: '', description: '', url: '', category: '' });
      setShowSuggestionModal(false);
    } catch (err) {
      toast.error("Failed to submit suggestion. Please try again.");
    }
  };

  const categories = ["All", ...new Set(tools.map(tool => tool.category_c))];

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Research": return "Search";
      case "Management": return "Settings";
      case "Optimization": return "TrendingUp";
      case "Analytics": return "BarChart3";
      case "Landing Pages": return "MousePointer";
      case "Creative": return "Image";
      case "Advertising Platform": return "Megaphone";
      case "Social Advertising": return "Users";
      default: return "Tool";
    }
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadTools} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 font-display">PPC Tools Directory</h1>
              <p className="text-blue-100 text-lg">Access requests for team tools and software</p>
            </div>
            <div className="hidden md:block">
              <ApperIcon name="Wrench" size={64} className="text-blue-200" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

{/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                <ApperIcon 
                  name={getCategoryIcon(category)} 
                  className="w-4 h-4 mr-2" 
                />
                {category}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <Empty 
          title="No tools found" 
          description="Try adjusting your search or category filter."
          icon="Search"
        />
      ) : (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.Id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                    <ApperIcon name={tool.icon_c || "Tool"} className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline">
                    {tool.category_c}
                  </Badge>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">
                    {tool.Name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {tool.description_c}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tool.Tags && tool.Tags.split(',').slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Voting Section */}
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVote(tool, 'like')}
                        disabled={voting === tool.Id}
                        className="p-1 hover:bg-green-100 hover:text-green-600"
                      >
                        <ApperIcon name="ThumbsUp" className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium text-green-600">
                        {tool.likes || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVote(tool, 'dislike')}
                        disabled={voting === tool.Id}
                        className="p-1 hover:bg-red-100 hover:text-red-600"
                      >
                        <ApperIcon name="ThumbsDown" className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium text-red-600">
                        {tool.dislikes || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={() => window.open(tool.url_c, '_blank', 'noopener,noreferrer')}
                    className="w-full"
                    variant="default"
                  >
                    <div className="flex items-center gap-2">
                      <ApperIcon name="ExternalLink" className="w-4 h-4" />
                      Visit Tool
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => handleRequestAccess(tool)}
                    disabled={requestingAccess === tool.Id}
                    className="w-full"
                    variant="outline"
                  >
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Mail" className="w-4 h-4" />
                      {requestingAccess === tool.Id ? "Requesting..." : "Request Access"}
                    </div>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
)}

      {/* Suggest Tool Section */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Lightbulb" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Missing a Tool?</h3>
                <p className="text-green-800 text-sm">
                  Don't see a tool you need? Suggest it to our team and we'll consider adding it to the directory.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowSuggestionModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Suggest Tool
            </Button>
          </div>
        </Card>
      )}

      {/* Tool Suggestion Modal */}
      {showSuggestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-display">Suggest a Tool</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestionModal(false)}
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSuggestTool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tool Name *
                </label>
                <input
                  type="text"
                  value={toolSuggestion.name}
                  onChange={(e) => setToolSuggestion(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter tool name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={toolSuggestion.description}
                  onChange={(e) => setToolSuggestion(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this tool does"
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={toolSuggestion.url}
                  onChange={(e) => setToolSuggestion(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={toolSuggestion.category}
                  onChange={(e) => setToolSuggestion(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">Select category</option>
                  <option value="Research">Research</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Advertising Platform">Advertising Platform</option>
                  <option value="Social Advertising">Social Advertising</option>
                  <option value="Optimization">Optimization</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSuggestionModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Submit Suggestion
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

{/* Access Request Info */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ApperIcon name="Info" className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Access Request Process</h3>
            <p className="text-blue-800 text-sm">
              When you request access to a tool, an email will be sent to Nathan Garrett 
              (nathan.garrett@autoshopsolutions.com) with your request details. You'll typically 
              receive a response within 1-2 business days with access instructions or account setup details.
              Use the voting system to help the team identify the most valuable tools.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Tools;