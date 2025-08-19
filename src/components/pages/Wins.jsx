import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { winService } from "@/services/api/winService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import TextArea from "@/components/atoms/TextArea";

const Wins = () => {
const [wins, setWins] = useState([]);
  const [filteredWins, setFilteredWins] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddWin, setShowAddWin] = useState(false);
  const [showEditWin, setShowEditWin] = useState(false);
  const [editingWin, setEditingWin] = useState(null);
  const [newWin, setNewWin] = useState({
    title: "",
    description: "",
    category: "professional"
  });
  const [saving, setSaving] = useState(false);
  const [givingAward, setGivingAward] = useState(null);
  const currentUser = {
    Id: 1,
    name: "Nathan Garrett",
    avatar: "NG"
  };

  useEffect(() => {
    loadWins();
  }, []);

  useEffect(() => {
    filterWins();
  }, [wins, selectedCategory]);

const loadWins = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await winService.getAll();
      setWins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


const handleAddWin = async () => {
    if (!newWin.title.trim() || !newWin.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSaving(true);
      const winData = {
        ...newWin,
        userId: currentUser.Id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar
      };

      const createdWin = await winService.create(winData);
      setWins([createdWin, ...wins]);
      setNewWin({ title: "", description: "", category: "professional" });
      setShowAddWin(false);
      toast.success("Win shared successfully! 🎉");
    } catch (err) {
      toast.error("Failed to share win. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditWin = (win) => {
    setEditingWin({
      id: win.Id,
      title: win.title || win.title_c,
      description: win.description || win.description_c,
      category: win.category || win.category_c
    });
    setShowEditWin(true);
  };

  const handleUpdateWin = async () => {
    if (!editingWin.title.trim() || !editingWin.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSaving(true);
      const updatedWin = await winService.update(editingWin.id, {
        title: editingWin.title,
        description: editingWin.description,
        category: editingWin.category
      });
      
      setWins(wins.map(win => 
        win.Id === editingWin.id ? updatedWin : win
      ));
      setEditingWin(null);
      setShowEditWin(false);
      toast.success("Win updated successfully! ✨");
    } catch (err) {
      toast.error("Failed to update win. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleGiveAward = async (winId, awardType) => {
    try {
      setGivingAward(winId);
      const awardData = {
        type: awardType,
        fromUser: currentUser.name,
        message: getAwardMessage(awardType)
      };

      await winService.addAward(winId, awardData);
      await loadWins(); // Reload to get updated awards
      toast.success(`${getAwardEmoji(awardType)} Award given!`);
    } catch (err) {
      toast.error("Failed to give award");
    } finally {
      setGivingAward(null);
    }
  };

  const getAwardMessage = (type) => {
    const messages = {
      star: "Outstanding achievement!",
      trophy: "Exceptional performance!",
      medal: "Well deserved recognition!"
    };
    return messages[type] || "Great job!";
  };

  const getAwardEmoji = (type) => {
    const emojis = {
      star: "⭐",
      trophy: "🏆",
      medal: "🥇"
    };
    return emojis[type] || "👏";
  };
const isValidDate = (timestamp) => {
    const date = new Date(timestamp);
    return date instanceof Date && !isNaN(date.getTime());
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

  const filterWins = () => {
    let filtered = wins.filter(win => {
      const timestamp = win.timestamp || win.timestamp_c;
      return isValidDate(timestamp);
    });

    if (selectedCategory !== "all") {
      filtered = filtered.filter(win => {
        const category = win.category || win.category_c;
        return category === selectedCategory;
      });
    }

    setFilteredWins(filtered);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadWins} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 font-display">Team Wins 🏆</h1>
              <p className="text-yellow-100">Celebrate achievements and give recognition</p>
            </div>
            <div className="hidden md:block">
              <ApperIcon name="Trophy" size={48} className="text-yellow-200" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Wins" },
              { key: "professional", label: "Professional" },
              { key: "personal", label: "Personal" }
            ].map((category) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.key)}
              >
                {category.label}
              </Button>
            ))}
          </div>

<Button onClick={() => setShowAddWin(true)}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Share a Win
          </Button>
        </div>
      </Card>

      {/* Wins List */}
      {filteredWins.length === 0 ? (
        <Empty 
          title="No wins shared yet" 
          description="Be the first to share a professional or personal achievement!"
          icon="Trophy"
          action={() => setShowAddWin(true)}
          actionLabel="Share a Win"
        />
      ) : (
        <div className="space-y-6">
          {filteredWins.map((win, index) => (
            <motion.div
              key={win.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
<Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">
                      {win.userAvatar || win.user_avatar_c || win.userName?.charAt(0) || win.user_name_c?.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{win.userName || win.user_name_c}</h3>
                        <Badge variant={(win.category || win.category_c) === 'professional' ? 'primary' : 'secondary'}>
                          {win.category || win.category_c}
                        </Badge>
                        <span className="text-sm text-gray-500">{formatTimeAgo(win.timestamp || win.timestamp_c)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditWin(win)}
                        className="hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                      >
                        <ApperIcon name="Edit" className="w-4 h-4" />
                      </Button>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-900 mb-2 font-display">
                      {win.title || win.title_c}
                    </h4>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {win.description || win.description_c}
                    </p>

                    {/* Awards Display */}
                    {win.awards && win.awards.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {win.awards.map((award, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg px-3 py-2"
                            >
                              <span className="text-lg">{getAwardEmoji(award.type)}</span>
                              <div>
                                <p className="text-sm font-medium text-yellow-800">
                                  {award.fromUser}
                                </p>
                                <p className="text-xs text-yellow-600">{award.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Award Actions */}
                    <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600 mr-2">Give recognition:</span>
                      {["star", "trophy", "medal"].map((awardType) => (
                        <Button
                          key={awardType}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGiveAward(win.Id, awardType)}
                          disabled={givingAward === win.Id}
                          className="hover:bg-yellow-50"
                        >
                          {givingAward === win.Id ? (
                            <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                          ) : (
                            <span className="text-base">{getAwardEmoji(awardType)}</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Win Modal */}
{showAddWin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddWin(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-full max-w-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold font-display">Share Your Win! 🎉</h3>
              <button
                onClick={() => setShowAddWin(false)}
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
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="professional"
                      checked={newWin.category === "professional"}
                      onChange={(e) => setNewWin({...newWin, category: e.target.value})}
                      className="mr-2"
                    />
                    Professional
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="personal"
                      checked={newWin.category === "personal"}
                      onChange={(e) => setNewWin({...newWin, category: e.target.value})}
                      className="mr-2"
                    />
                    Personal
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Win Title
                </label>
                <Input
                  value={newWin.title}
                  onChange={(e) => setNewWin({...newWin, title: e.target.value})}
                  placeholder="What did you achieve?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <TextArea
                  value={newWin.description}
                  onChange={(e) => setNewWin({...newWin, description: e.target.value})}
                  placeholder="Tell us more about your achievement..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddWin}
                  disabled={!newWin.title.trim() || !newWin.description.trim() || saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Trophy" className="w-4 h-4 mr-2" />
                      Share Win
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowAddWin(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showEditWin && editingWin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEditWin(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-full max-w-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold font-display">Edit Your Win ✨</h3>
              <button
                onClick={() => setShowEditWin(false)}
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
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="professional"
                      checked={editingWin.category === "professional"}
                      onChange={(e) => setEditingWin({...editingWin, category: e.target.value})}
                      className="mr-2"
                    />
                    Professional
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="personal"
                      checked={editingWin.category === "personal"}
                      onChange={(e) => setEditingWin({...editingWin, category: e.target.value})}
                      className="mr-2"
                    />
                    Personal
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Win Title
                </label>
                <Input
                  value={editingWin.title}
                  onChange={(e) => setEditingWin({...editingWin, title: e.target.value})}
                  placeholder="What did you achieve?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <TextArea
                  value={editingWin.description}
                  onChange={(e) => setEditingWin({...editingWin, description: e.target.value})}
                  placeholder="Tell us more about your achievement..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleUpdateWin}
                  disabled={!editingWin.title.trim() || !editingWin.description.trim() || saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                      Update Win
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowEditWin(false)}>
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

export default Wins;