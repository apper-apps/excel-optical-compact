import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { userService } from "@/services/api/userService";
import { userMetricsService } from "@/services/api/userMetricsService";
import { messageService } from "@/services/api/messageService";
import { winService } from "@/services/api/winService";
import ApperIcon from "@/components/ApperIcon";
import Wins from "@/components/pages/Wins";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
const Dashboard = () => {
const [metrics, setMetrics] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentWins, setRecentWins] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  useEffect(() => {
    loadDashboardData();
  }, []);

const loadDashboardData = async () => {
    try {
      setError("");
      setLoading(true);
      
      const [metricsData, messagesData, winsData, userData] = await Promise.all([
        userMetricsService.getAll(),
        messageService.getRecent(),
        winService.getRecent(),
        userService.getCurrentUser()
      ]);
      
      setMetrics(metricsData || []);
      setRecentMessages(messagesData || []);
      setRecentWins(winsData || []);
      setCurrentUser(userData);
    } catch (err) {
      setError(`Failed to load dashboard data: ${err.message}`);
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

  const handleDeleteAccount = async () => {
    setActionLoading(true);
    try {
      await userService.delete(currentUser.Id);
      toast.success("Account deleted successfully");
      // In a real app, this would redirect to login
      setShowDeleteConfirm(false);
    } catch (err) {
      toast.error(`Failed to delete account: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
};

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;
  const totalMetrics = {
    totalSpend: metrics.reduce((sum, m) => sum + m.cost, 0),
    totalConversions: metrics.reduce((sum, m) => sum + m.conversions, 0),
    totalClicks: metrics.reduce((sum, m) => sum + m.clicks, 0),
    avgOptScore: Math.round(metrics.reduce((sum, m) => sum + m.optimizationScore, 0) / metrics.length)
  };
  return (
    <div className="space-y-8">
    {/* Header */}
    <div
        className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-8 text-white">
        <motion.div
            initial={{
                opacity: 0,
                y: 20
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold mb-2 font-display">Welcome to PPC Hub</h1>
                <p className="text-blue-100 text-lg">Your team collaboration platform for PPC excellence</p>
            </div>
            <div className="hidden md:block">
                <ApperIcon name="TrendingUp" size={64} className="text-blue-200" />
            </div>
        </motion.div>
    </div>
    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
            initial={{
                opacity: 0,
                y: 20
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            transition={{
                delay: 0.1
            }}>
            <Card
                className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Spend</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(totalMetrics.totalSpend)}
                        </p>
                    </div>
                    <div
                        className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <ApperIcon name="DollarSign" className="w-6 h-6 text-primary" />
                    </div>
                </div>
            </Card>
        </motion.div>
        <motion.div
            initial={{
                opacity: 0,
                y: 20
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            transition={{
                delay: 0.2
            }}>
            <Card
                className="p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Conversions</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(totalMetrics.totalConversions)}
                        </p>
                    </div>
                    <div
                        className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                        <ApperIcon name="Target" className="w-6 h-6 text-secondary" />
                    </div>
                </div>
            </Card>
        </motion.div>
        <motion.div
            initial={{
                opacity: 0,
                y: 20
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            transition={{
                delay: 0.3
            }}>
            <Card
                className="p-6 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Clicks</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(totalMetrics.totalClicks)}
                        </p>
                    </div>
                    <div
                        className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                        <ApperIcon name="MousePointer" className="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
            </Card>
        </motion.div>
        <motion.div
            initial={{
                opacity: 0,
                y: 20
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            transition={{
                delay: 0.4
            }}>
            <Card
                className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Avg. Opt. Score</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {totalMetrics.avgOptScore}%
                                            </p>
                    </div>
                    <div
                        className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                        <ApperIcon name="TrendingUp" className="w-6 h-6 text-accent" />
                    </div>
                </div>
            </Card>
        </motion.div>
    </div>
    {/* Recent Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Messages */}
        <motion.div
            initial={{
                opacity: 0,
                x: -20
            }}
            animate={{
                opacity: 1,
                x: 0
            }}
            transition={{
                delay: 0.5
            }}>
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold font-display">Recent Messages</h2>
                    <Button variant="ghost" size="sm">View All
                                        <ApperIcon name="ArrowRight" className="w-4 h-4 ml-2" />
                    </Button>
                </div>
                <div className="space-y-4">
                    {recentMessages.map(message => <div key={message.Id} className="flex items-start space-x-3">
                        <div
                            className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                                {message.userAvatar}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">
                                    {message.userName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {new Date(message.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {message.content}
                            </p>
                        </div>
                    </div>)}
                </div>
            </Card>
        </motion.div>
        {/* Recent Wins */}
        <motion.div
            initial={{
                opacity: 0,
                x: 20
            }}
            animate={{
                opacity: 1,
                x: 0
            }}
            transition={{
                delay: 0.6
            }}>
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold font-display">Recent Wins</h2>
                    <Button variant="ghost" size="sm">View All
                                        <ApperIcon name="ArrowRight" className="w-4 h-4 ml-2" />
                    </Button>
                </div>
                <div className="space-y-4">
                    {recentWins.map(win => <div key={win.Id} className="flex items-start space-x-3">
                        <div
                            className="w-8 h-8 bg-gradient-to-br from-warning to-yellow-500 rounded-full flex items-center justify-center">
                            <ApperIcon name="Trophy" className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">
                                    {win.userName}
                                </p>
                                <span
                                    className={`px-2 py-1 text-xs rounded-full ${win.category === "professional" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                                    {win.category}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-800 mt-1">
                                {win.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {win.description}
                            </p>
                        </div>
                    </div>)}
                </div>
            </Card>
        </motion.div>
    </div>
    {/* Team Performance Overview */}
    <motion.div
        initial={{
            opacity: 0,
            y: 20
        }}
        animate={{
            opacity: 1,
            y: 0
        }}
        transition={{
            delay: 0.7
        }}>
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 font-display">Team Performance Overview</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 font-medium text-gray-600">Account Manager</th>
                            <th className="text-left py-3 font-medium text-gray-600">Account</th>
                            <th className="text-right py-3 font-medium text-gray-600">Opt. Score</th>
                            <th className="text-right py-3 font-medium text-gray-600">Conversions</th>
                            <th className="text-right py-3 font-medium text-gray-600">Spend</th>
                            <th className="text-right py-3 font-medium text-gray-600">Conv. Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.slice(1).map(
                            metric => <tr key={metric.Id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-semibold">
                                                {metric.userName.split(" ").map(n => n[0]).join("")}
                                            </span>
                                        </div>
                                        <span className="font-medium text-gray-900">{metric.userName}</span>
                                    </div>
                                </td>
                                <td className="py-3 text-gray-600">{metric.account}</td>
                                <td className="py-3 text-right">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${metric.optimizationScore >= 90 ? "bg-secondary/10 text-secondary" : metric.optimizationScore >= 80 ? "bg-warning/10 text-yellow-700" : "bg-accent/10 text-accent"}`}>
                                        {metric.optimizationScore}%
                                                              </span>
                                </td>
                                <td className="py-3 text-right font-medium text-gray-900">
                                    {formatNumber(metric.conversions)}
                                </td>
                                <td className="py-3 text-right font-medium text-gray-900">
                                    {formatCurrency(metric.cost)}
                                </td>
                                <td className="py-3 text-right font-medium text-gray-900">
                                    {metric.conversionRate}%
                                                        </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    </motion.div>
    {/* Account Settings Section */}
    <motion.div
        initial={{
            opacity: 0,
            y: 20
        }}
        animate={{
            opacity: 1,
            y: 0
        }}
        transition={{
            delay: 0.6
        }}>
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                        <ApperIcon name="User" className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold font-display">Account Settings</h2>
                        <p className="text-sm text-gray-600">Manage your account preferences</p>
                    </div>
                </div>
            </div>
            {currentUser && <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900">{currentUser.name}</h3>
                            <p className="text-sm text-gray-600">{currentUser.email}</p>
                            <Badge variant="outline" className="mt-2">
                                {currentUser.role}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900">Delete Account</h4>
                            <p className="text-sm text-gray-600">Permanently remove your account and all data</p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-red-600 hover:bg-red-700">
                            <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />Delete Account
                                                </Button>
                    </div>
                </div>
            </div>}
        </Card>
    </motion.div>
    {/* Delete Account Confirmation Modal */}
    {showDeleteConfirm && <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
            initial={{
                opacity: 0,
                scale: 0.95
            }}
            animate={{
                opacity: 1,
                scale: 1
            }}
            className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <ApperIcon name="AlertTriangle" className="w-5 h-5 text-red-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold font-display">Delete Account</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
            </div>
            <p className="text-gray-700 mb-6">Are you sure you want to delete your account? This will permanently remove all your data, 
                                metrics, and access to the platform. You will not be able to recover this information.
                              </p>
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1">Cancel
                                    </Button>
                <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700">
                    {actionLoading ? "Deleting..." : "Delete Account"}
                </Button>
            </div>
        </motion.div>
    </div>}
</div>
  );
};

export default Dashboard;