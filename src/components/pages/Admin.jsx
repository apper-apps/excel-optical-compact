import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { userService } from "@/services/api/userService";
import { userMetricsService } from "@/services/api/userMetricsService";
import { learningService } from "@/services/api/learningService";
import { toolService } from "@/services/api/toolService";
import ApperIcon from "@/components/ApperIcon";
import Dashboard from "@/components/pages/Dashboard";
import Tools from "@/components/pages/Tools";
import Learning from "@/components/pages/Learning";
import Settings from "@/components/pages/Settings";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
const Admin = () => {
const [users, setUsers] = useState([]);
  const [userMetrics, setUserMetrics] = useState([]);
  const [tools, setTools] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLearningPages: 0,
    totalTools: 0,
    avgOptimizationScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState(null);
  const [learningLinks, setLearningLinks] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user'
  });
  const [newLink, setNewLink] = useState({
    title: '',
    description: '',
    url: ''
  });
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    url: '',
    category: '',
    icon: 'Tool'
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setError("");
      setLoading(true);
      
const [usersData, metricsData, learningData, toolsData] = await Promise.all([
        userService.getAll(),
        userMetricsService.getAll(),
        learningService.getAll(),
        toolService.getAll()
      ]);
      
setUsers(usersData);
      setUserMetrics(metricsData);
      setLearningLinks(learningData);
      setTools(toolsData);
      
      const avgOptScore = metricsData.length > 0 
        ? Math.round(metricsData.reduce((sum, m) => sum + m.optimizationScore, 0) / metricsData.length)
        : 0;
      
      setStats({
        totalUsers: usersData.length,
        totalLearningPages: learningData.length,
        totalTools: toolsData.length,
        avgOptimizationScore: avgOptScore
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

const formatDate = (dateString) => {
    if (!dateString || dateString === 'undefined' || dateString === 'null') {
      return 'Never';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      toast.error("Please fill in all fields");
      return;
    }

    setActionLoading(true);
    try {
      const createdUser = await userService.create(newUser);
      await userService.sendInvitation(createdUser.email, createdUser.role);
      
      setUsers(prev => [...prev, createdUser]);
      setNewUser({ name: '', email: '', role: 'user' });
      setShowCreateModal(false);
      toast.success(`User ${createdUser.name} created and invited successfully!`);
    } catch (err) {
      toast.error(`Failed to create user: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setActionLoading(true);
    try {
      const deletedUser = await userService.delete(userId);
      setUsers(prev => prev.filter(u => u.Id !== userId));
      setShowDeleteConfirm(null);
      toast.success(`User ${deletedUser.name} has been removed`);
    } catch (err) {
      toast.error(`Failed to delete user: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedUser = await userService.update(userId, { role: newRole });
      setUsers(prev => prev.map(u => u.Id === userId ? updatedUser : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      toast.error(`Failed to update role: ${err.message}`);
    }
  };
const handleCreateLink = async (e) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) {
      toast.error("Please fill in title and URL");
      return;
    }

    setActionLoading(true);
    try {
      const createdLink = await learningService.create({
        title_c: newLink.title,
        description_c: newLink.description,
        url_c: newLink.url,
        type_c: 'link'
      });
      
      setLearningLinks(prev => [...prev, createdLink]);
      setNewLink({ title: '', description: '', url: '' });
      setShowLinkModal(false);
      toast.success(`Learning hub link "${createdLink.title_c}" created successfully!`);
    } catch (err) {
      toast.error(`Failed to create link: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditLink = async (e) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) {
      toast.error("Please fill in title and URL");
      return;
    }

    setActionLoading(true);
    try {
      const updatedLink = await learningService.update(linkToEdit.Id, {
        title_c: newLink.title,
        description_c: newLink.description,
        url_c: newLink.url
      });
      
      setLearningLinks(prev => prev.map(link => link.Id === linkToEdit.Id ? updatedLink : link));
      setNewLink({ title: '', description: '', url: '' });
      setShowEditLinkModal(false);
      setLinkToEdit(null);
      toast.success(`Learning hub link updated successfully!`);
    } catch (err) {
      toast.error(`Failed to update link: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLink = async (linkId) => {
    setActionLoading(true);
    try {
      await learningService.delete(linkId);
      setLearningLinks(prev => prev.filter(link => link.Id !== linkId));
      toast.success(`Learning hub link has been removed`);
    } catch (err) {
      toast.error(`Failed to delete link: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (link) => {
    setLinkToEdit(link);
    setNewLink({
      title: link.title_c || '',
      description: link.description_c || '',
      url: link.url_c || ''
    });
    setShowEditLinkModal(true);
  };
const handleCreateTool = async (e) => {
    e.preventDefault();
    if (!newTool.name || !newTool.url) {
      toast.error("Please fill in tool name and URL");
      return;
    }

    setActionLoading(true);
    try {
      const createdTool = await toolService.create({
        Name: newTool.name,
        description_c: newTool.description,
        url_c: newTool.url,
        category_c: newTool.category,
        icon_c: newTool.icon,
        Tags: '',
        likes: 0,
        dislikes: 0
      });
      
      setTools(prev => [...prev, createdTool]);
      setNewTool({ name: '', description: '', url: '', category: '', icon: 'Tool' });
      setShowToolModal(false);
      toast.success(`Tool "${createdTool.Name}" added successfully!`);
    } catch (err) {
      toast.error(`Failed to create tool: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTool = async (toolId) => {
    try {
      await toolService.delete(toolId);
      setTools(prev => prev.filter(tool => tool.Id !== toolId));
      toast.success(`Tool has been removed`);
    } catch (err) {
      toast.error(`Failed to delete tool: ${err.message}`);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "BarChart3" },
    { id: "users", label: "Users", icon: "Users" },
    { id: "tools", label: "Tools", icon: "Wrench" },
    { id: "performance", label: "Performance", icon: "TrendingUp" },
    { id: "settings", label: "Settings", icon: "User" }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadAdminData} />;

return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 font-display">Admin Dashboard</h1>
              <p className="text-gray-300">Manage team content, users, and system settings</p>
            </div>
            <div className="hidden md:block">
              <ApperIcon name="Settings" size={48} className="text-gray-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <Card className="p-4">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-2"
            >
              <ApperIcon name={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="Users" className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Learning Pages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLearningPages}</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="GraduationCap" className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Available Tools</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTools}</p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="Wrench" className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg. Opt. Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgOptimizationScore}%</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="TrendingUp" className="w-6 h-6 text-accent" />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 font-display">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setShowLinkModal(true)}
              >
                <ApperIcon name="Plus" className="w-6 h-6 text-primary" />
                <span>Add Learning Hub Link</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setShowToolModal(true)}
              >
                <ApperIcon name="Wrench" className="w-6 h-6 text-secondary" />
                <span>Add Tool</span>
              </Button>
<Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setShowCreateModal(true)}
              >
                <ApperIcon name="UserPlus" className="w-6 h-6 text-accent" />
                <span>Add User</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Tools Management Tab */}
      {activeTab === "tools" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold font-display">Tools Management</h2>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setShowToolModal(true)}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Plus" className="w-4 h-4" />
                  Add Tool
                </Button>
                <Badge variant="outline">
                  {tools.length} Tools
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card key={tool.Id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                      <ApperIcon name={tool.icon_c || "Tool"} className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {tool.category_c}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{tool.Name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tool.description_c}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <ApperIcon name="ThumbsUp" className="w-3 h-3 text-green-600" />
                      {tool.likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ApperIcon name="ThumbsDown" className="w-3 h-3 text-red-600" />
                      {tool.dislikes || 0}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(tool.url_c, '_blank')}
                      className="flex-1"
                    >
                      <ApperIcon name="ExternalLink" className="w-3 h-3 mr-1" />
                      Visit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTool(tool.Id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Add Tool Modal */}
      {showToolModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-display">Add New Tool</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowToolModal(false)}
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateTool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tool Name *
                </label>
                <Input
                  value={newTool.name}
                  onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter tool name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTool.description}
                  onChange={(e) => setNewTool(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this tool does"
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL *
                </label>
                <Input
                  type="url"
                  value={newTool.url}
                  onChange={(e) => setNewTool(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newTool.category}
                  onChange={(e) => setNewTool(prev => ({ ...prev, category: e.target.value }))}
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
                  onClick={() => setShowToolModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? "Adding..." : "Add Tool"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
)}

      {activeTab === "users" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold font-display">Team Members</h2>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Plus" className="w-4 h-4" />
                  Create User
                </Button>
                <Badge variant="outline">
                  {users.length} Active Users
                </Badge>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 font-medium text-gray-600">User</th>
                    <th className="text-left py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 font-medium text-gray-600">Role</th>
                    <th className="text-left py-3 font-medium text-gray-600">Last Active</th>
                    <th className="text-left py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.Id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {user.avatar}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">{user.email}</td>
                      <td className="py-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.Id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:border-primary focus:outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 text-gray-600">{formatDate(user.lastActive)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(user.sheetLink, '_blank')}
                          >
                            <ApperIcon name="ExternalLink" className="w-4 h-4" />
                          </Button>
                          {user.Id !== 1 && ( // Don't allow deleting admin user
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowDeleteConfirm(user)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <ApperIcon name="Trash2" className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-display">Create New User</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? "Creating..." : "Create & Invite"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ApperIcon name="AlertTriangle" className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold font-display">Remove User</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove <strong>{showDeleteConfirm.name}</strong> from the system? 
              They will lose access to all data and tools.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteUser(showDeleteConfirm.Id)}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? "Removing..." : "Remove User"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === "performance" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold font-display">Account Performance Dashboard</h2>
              <Button variant="outline" size="sm">
                <ApperIcon name="Download" className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 font-medium text-gray-600">Account</th>
                    <th className="text-right py-3 font-medium text-gray-600">Opt. Score</th>
                    <th className="text-left py-3 font-medium text-gray-600">Manager</th>
                    <th className="text-left py-3 font-medium text-gray-600">Type</th>
                    <th className="text-right py-3 font-medium text-gray-600">Clicks</th>
                    <th className="text-right py-3 font-medium text-gray-600">CTR</th>
                    <th className="text-right py-3 font-medium text-gray-600">Cost</th>
                    <th className="text-right py-3 font-medium text-gray-600">Conversions</th>
                    <th className="text-right py-3 font-medium text-gray-600">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {userMetrics.slice(1).map((metric) => (
                    <tr key={metric.Id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <div className="font-medium text-gray-900">{metric.account}</div>
                          <div className="text-xs text-gray-500">{metric.userName}</div>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant={
                          metric.optimizationScore >= 90 ? 'secondary' :
                          metric.optimizationScore >= 80 ? 'warning' : 'accent'
                        }>
                          {metric.optimizationScore}%
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-600">{metric.directManager}</td>
                      <td className="py-3 text-gray-600">{metric.accountType}</td>
                      <td className="py-3 text-right font-medium">{formatNumber(metric.clicks)}</td>
                      <td className="py-3 text-right font-medium">{metric.ctr}%</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(metric.cost)}</td>
                      <td className="py-3 text-right font-medium">{formatNumber(metric.conversions)}</td>
                      <td className="py-3 text-right font-medium">{metric.conversionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
)}

      {/* Learning Hub Links Section */}
      {activeTab === "overview" && learningLinks.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 font-display">Learning Hub Links</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-medium text-gray-600">Title</th>
                  <th className="text-left py-3 font-medium text-gray-600">Description</th>
                  <th className="text-left py-3 font-medium text-gray-600">URL</th>
                  <th className="text-left py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {learningLinks.map((link) => (
                  <tr key={link.Id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{link.title_c}</td>
                    <td className="py-3 text-gray-600 max-w-xs truncate">{link.description_c || 'No description'}</td>
                    <td className="py-3">
                      <a 
                        href={link.url_c} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline max-w-xs truncate block"
                      >
                        {link.url_c}
                      </a>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditModal(link)}
                        >
                          <ApperIcon name="Edit" className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteLink(link.Id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Learning Hub Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-display">Add Learning Hub Link</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkModal(false)}
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Title
                </label>
                <Input
                  value={newLink.title}
                  onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter link title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <Input
                  value={newLink.description}
                  onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <Input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? "Adding..." : "Add Link"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Learning Hub Link Modal */}
      {showEditLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-display">Edit Learning Hub Link</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditLinkModal(false);
                  setLinkToEdit(null);
                }}
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleEditLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Title
                </label>
                <Input
                  value={newLink.title}
                  onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter link title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <Input
                  value={newLink.description}
                  onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <Input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditLinkModal(false);
                    setLinkToEdit(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? "Updating..." : "Update Link"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

{/* Settings Tab */}
      {activeTab === "settings" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Settings />
        </motion.div>
      )}
    </div>
  );
};

export default Admin;