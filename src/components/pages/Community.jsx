import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { messageService } from "@/services/api/messageService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import TextArea from "@/components/atoms/TextArea";
const Community = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

// Get current user from Redux
  const { user: currentUser } = useSelector((state) => state.user) || {
    Id: 1,
    name: "Nathan Garrett",
    avatar: "NG"
  };

  // Common emojis for quick access
  const commonEmojis = ['👍', '❤️', '😊', '😂', '🎉', '👏', '🔥', '💯', '😮', '😢', '😡', '🤔', '👋', '✅', '❌', '⭐'];
  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

const loadMessages = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await messageService.getAll();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("Failed to load messages. Please try again.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    try {
      setSending(true);
      const messageData = {
        user_id_c: currentUser.userId || currentUser.Id || 1,
        user_name_c: currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.name || 'Unknown User',
        user_avatar_c: currentUser.avatar || '',
        content_c: newMessage.trim(),
        attachments_c: selectedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      };

      const sentMessage = await messageService.create(messageData);
      if (sentMessage) {
        await loadMessages();
        setNewMessage("");
        setSelectedFiles([]);
        scrollToBottom();
        toast.success("Message sent!");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };
const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const message = messages.find(m => m.Id === messageId);
      if (!message) return;

      const currentReactions = message.reactions_c ? JSON.parse(message.reactions_c) : {};
      const userId = currentUser.userId || currentUser.Id || 1;
      
      if (!currentReactions[emoji]) {
        currentReactions[emoji] = [];
      }

      const userIndex = currentReactions[emoji].indexOf(userId);
      if (userIndex > -1) {
        currentReactions[emoji].splice(userIndex, 1);
        if (currentReactions[emoji].length === 0) {
          delete currentReactions[emoji];
        }
      } else {
        currentReactions[emoji].push(userId);
      }

      await messageService.update(messageId, { 
        reactions_c: JSON.stringify(currentReactions) 
      });
      
      await loadMessages();
      toast.success("Reaction updated!");
    } catch (err) {
      console.error("Error updating reaction:", err);
      toast.error("Failed to update reaction.");
    }
  };

const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
      if (validFiles.length !== files.length) {
        toast.warning("Some files exceed 10MB limit and were excluded.");
      }
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) selected for upload.`);
    }
  };

  const removeFile = (fileIndex) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== fileIndex));
  };

const formatTime = (timestamp) => {
    const timeValue = timestamp;
    if (!timeValue) return 'Invalid date';
    
    const date = new Date(timeValue);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessageId(message.Id);
    setEditingContent(message.content_c || message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingContent.trim() || !editingMessageId) return;

    try {
      setIsEditing(true);
      await messageService.update(editingMessageId, {
        content_c: editingContent.trim()
      });
      
      const updatedMessages = await messageService.getAll();
      setMessages(updatedMessages);
      setEditingMessageId(null);
      setEditingContent("");
      toast.success("Message updated!");
    } catch (err) {
      toast.error("Failed to update message. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      await messageService.delete(messageId);
      setMessages(messages.filter(msg => msg.Id !== messageId));
      toast.success("Message deleted!");
    } catch (err) {
      toast.error("Failed to delete message. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadMessages} />;

  const commonEmojis = ["👍", "❤️", "😂", "🎉", "🚀", "💡", "🔥", "👏"];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadMessages} />;

return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-green-600 rounded-xl p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 font-display">Team Chat</h1>
              <p className="text-green-100">Connect, share, and collaborate with your PPC team</p>
            </div>
            <div className="hidden md:block">
              <ApperIcon name="MessageCircle" size={48} className="text-green-200" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chat Messages */}
      <Card className="min-h-[600px] max-h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <Empty
              title="No messages yet"
              description="Start the conversation by sending the first message!"
              icon="MessageCircle"
            />
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex space-x-3"
              >
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-semibold">
                    {message.user_avatar_c ? (
                      <img src={message.user_avatar_c} alt={message.user_name_c} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      message.user_name_c?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {message.user_name_c || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp_c || message.CreatedOn)}
                    </span>
                    {message.is_edited_c && (
                      <span className="text-xs text-gray-400 italic">(edited)</span>
                    )}
                  </div>

                  {/* Message Text */}
                  {editingMessageId === message.Id ? (
                    <div className="space-y-2">
                      <TextArea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onKeyPress={handleEditKeyPress}
                        className="text-sm resize-none"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 relative group">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {message.content_c || 'No content'}
                      </p>

                      {/* Attachments */}
                      {message.attachments_c && (
                        <div className="mt-2 space-y-1">
                          {JSON.parse(message.attachments_c).map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-2 text-xs text-gray-600 bg-white rounded p-2">
                              <ApperIcon name="Paperclip" size={12} />
                              <span>{attachment.name}</span>
                              <span className="text-gray-400">({Math.round(attachment.size / 1024)}KB)</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reactions */}
                      {message.reactions_c && Object.keys(JSON.parse(message.reactions_c)).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(JSON.parse(message.reactions_c)).map(([emoji, userIds]) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(message.Id, emoji)}
                              className="flex items-center space-x-1 bg-white rounded-full px-2 py-1 text-xs hover:bg-gray-100 transition-colors border"
                            >
                              <span>{emoji}</span>
                              <span className="text-gray-600">{userIds.length}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Message Actions */}
                      {(currentUser.userId === message.user_id_c || currentUser.Id === message.user_id_c) && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditMessage(message)}
                              className="p-1 rounded hover:bg-gray-200 transition-colors"
                              title="Edit message"
                            >
                              <ApperIcon name="Edit2" size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(message.Id)}
                              className="p-1 rounded hover:bg-red-100 hover:text-red-600 transition-colors"
                              title="Delete message"
                              disabled={isDeleting}
                            >
                              <ApperIcon name="Trash2" size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Reaction Buttons */}
                  {editingMessageId !== message.Id && (
                    <div className="flex space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {commonEmojis.slice(0, 6).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(message.Id, emoji)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-sm"
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

</div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {currentUser?.avatar}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col space-y-3">
                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Attached Files:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFiles([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                          <div className="flex items-center space-x-2">
                            <ApperIcon name="File" size={14} />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">({Math.round(file.size / 1024)}KB)</span>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <ApperIcon name="X" size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <TextArea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                  className="min-h-[80px] resize-none"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFileUpload}
                    >
                      <ApperIcon name="Paperclip" className="w-4 h-4 mr-2" />
                      Attach
                    </Button>
                    
                    {/* Emoji Picker Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <ApperIcon name="Smile" className="w-4 h-4 mr-2" />
                      Emoji
                    </Button>
                    
                    {/* Quick Emoji Buttons */}
                    <div className="flex space-x-1">
                      {commonEmojis.slice(0, 6).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setNewMessage(newMessage + emoji)}
                          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                          title={`Add ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending}
                  >
                    {sending ? (
                      <>
                        <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Send" className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>

                {/* Extended Emoji Picker */}
                {showEmojiPicker && (
                  <div className="bg-white border rounded-lg p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Pick an emoji</span>
                      <button
                        onClick={() => setShowEmojiPicker(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <ApperIcon name="X" size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                      {commonEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setNewMessage(newMessage + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.csv,.xlsx"
        className="hidden"
      />
    </div>
  );
};

export default Community;