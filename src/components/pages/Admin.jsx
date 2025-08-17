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
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
const Admin = () => {
const [users, setUsers] = useState([]);
  const [userMetrics, setUserMetrics] = useState([]);
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
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user'
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
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const tabs = [
    { id: "overview", label: "Overview", icon: "BarChart3" },
    { id: "users", label: "Users", icon: "Users" },
    { id: "performance", label: "Performance", icon: "TrendingUp" }
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
              <p className="text-gray-300">Manage team content and monitor activity</p>
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
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <ApperIcon name="Plus" className="w-6 h-6 text-primary" />
                <span>Add Learning Page</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <ApperIcon name="Tool" className="w-6 h-6 text-secondary" />
                <span>Add Tool</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <ApperIcon name="Code" className="w-6 h-6 text-warning" />
                <span>Add Script</span>
              </Button>
            </div>
          </Card>
        </motion.div>
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
    </div>
  );
};

export default Admin;