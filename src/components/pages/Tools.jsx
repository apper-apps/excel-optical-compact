import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { toolService } from "@/services/api/toolService";

const Tools = () => {
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestingAccess, setRequestingAccess] = useState(null);

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

  const categories = ["All", ...new Set(tools.map(tool => tool.category))];

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Research": return "Search";
      case "Management": return "Settings";
      case "Optimization": return "TrendingUp";
      case "Analytics": return "BarChart3";
      case "Landing Pages": return "MousePointer";
      case "Creative": return "Image";
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
                    <ApperIcon name={tool.icon} className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline">
                    {tool.category}
                  </Badge>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">
                    {tool.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {tool.description}
                  </p>
                </div>

<Button
                  onClick={() => window.open(tool.url_c, '_blank', 'noopener,noreferrer')}
                  className="w-full mt-auto"
                  variant="default"
                >
                  <div className="flex items-center gap-2">
                    <ApperIcon name="ExternalLink" className="w-4 h-4" />
                    Visit Tool
                  </div>
                </Button>
              </Card>
            </motion.div>
          ))}
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
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Tools;