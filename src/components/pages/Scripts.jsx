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
import { scriptService } from "@/services/api/scriptService";

const Scripts = () => {
  const [scripts, setScripts] = useState([]);
  const [filteredScripts, setFilteredScripts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadScripts();
  }, []);

  useEffect(() => {
    filterScripts();
  }, [scripts, selectedCategory, searchTerm]);

  const loadScripts = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await scriptService.getAll();
      setScripts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterScripts = () => {
    let filtered = scripts;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(script => script.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(script =>
        script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredScripts(filtered);
  };

  const handleScriptClick = (script) => {
    window.open(script.link, '_blank');
    toast.success(`Opening ${script.name} script`);
  };

const categories = ["All", ...new Set(scripts.map(script => script.category))];
  
  // Add Script Modal State
  const [showAddModal, setShowAddModal] = useState(false);
const [scriptForm, setScriptForm] = useState({
    name: '',
    description: '',
    category: '',
    link: '',
    tags: ''
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Bidding": return "TrendingUp";
      case "Monitoring": return "Eye";
      case "Testing": return "TestTube";
      case "Budget Management": return "DollarSign";
      case "Optimization": return "Zap";
      case "Research": return "Search";
      case "Quality Assurance": return "CheckCircle";
      default: return "Code";
    }
  };

  const handleAddScript = async (e) => {
    e.preventDefault();
if (!scriptForm.name || !scriptForm.description || !scriptForm.category || !scriptForm.link) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const newScript = await scriptService.create({
        name: scriptForm.name,
        description: scriptForm.description,
        category: scriptForm.category,
link_c: scriptForm.link,
        Tags: scriptForm.tags
      });
      
      setScripts(prev => [...prev, newScript]);
      toast.success("Script added successfully!");
setScriptForm({ name: '', description: '', category: '', link: '', tags: '' });
      setShowAddModal(false);
    } catch (err) {
      toast.error("Failed to add script. Please try again.");
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Bidding": return "primary";
      case "Monitoring": return "secondary";
      case "Testing": return "warning";
      case "Budget Management": return "accent";
      case "Optimization": return "primary";
      case "Research": return "secondary";
      case "Quality Assurance": return "accent";
      default: return "default";
    }
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadScripts} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl p-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
<div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 font-display">Google Ads Scripts Repository</h1>
              <p className="text-gray-300 text-lg">Ready-to-use automation scripts for Google Ads optimization</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                variant="outline"
              >
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Script
              </Button>
              <div className="hidden md:block">
                <ApperIcon name="Code" size={64} className="text-gray-400" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Script Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-display">Add New Script</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleAddScript} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Script Name *
                </label>
                <input
                  type="text"
                  value={scriptForm.name}
                  onChange={(e) => setScriptForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter script name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={scriptForm.description}
                  onChange={(e) => setScriptForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this script does"
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={scriptForm.category}
                  onChange={(e) => setScriptForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Bidding">Bidding</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Testing">Testing</option>
                  <option value="Budget Management">Budget Management</option>
                  <option value="Optimization">Optimization</option>
                  <option value="Research">Research</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
Google Ads Script Link *
                </label>
                <input
                  type="url"
                  value={scriptForm.link}
                  onChange={(e) => setScriptForm(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://script.google.com/d/your-script-id/edit"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={scriptForm.tags}
                  onChange={(e) => setScriptForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="automation, pmax, bidding (comma separated)"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Add Script
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search scripts..."
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

      {/* Scripts Grid */}
      {filteredScripts.length === 0 ? (
        <Empty 
          title="No scripts found" 
          description="Try adjusting your search or category filter."
          icon="Code"
        />
      ) : (
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredScripts.map((script, index) => (
            <motion.div
              key={`script-${script.Id || 'no-id'}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                    onClick={() => handleScriptClick(script)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <ApperIcon name={getCategoryIcon(script.category)} className="w-6 h-6 text-gray-700" />
                  </div>
                  <Badge variant={getCategoryColor(script.category)}>
                    {script.category}
                  </Badge>
                </div>

                <div className="flex-1 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 font-display flex items-center">
                    {script.name}
                    <ApperIcon name="ExternalLink" className="w-4 h-4 ml-2 text-gray-400" />
                  </h3>
                  <p className="text-gray-600 line-clamp-3">
                    {script.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
<div className="flex items-center text-sm text-gray-500">
                    <ApperIcon name="ExternalLink" className="w-4 h-4 mr-2" />
                    Open Script
                  </div>
                  <Button variant="ghost" size="sm">
                    <ApperIcon name="ArrowRight" className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Usage Instructions */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ApperIcon name="Info" className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">How to Use Google Ads Scripts</h3>
            <div className="text-blue-800 text-sm space-y-2">
              <p>1. Click on any script card to open its GitHub repository</p>
              <p>2. Copy the script code and paste it into your Google Ads Scripts section</p>
              <p>3. Configure the script parameters according to your account needs</p>
              <p>4. Test the script in preview mode before authorizing</p>
              <p>5. Schedule the script to run automatically at optimal intervals</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Scripts;