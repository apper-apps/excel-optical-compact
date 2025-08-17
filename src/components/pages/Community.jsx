import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import TextArea from "@/components/atoms/TextArea";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { messageService } from "@/services/api/messageService";

const Community = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUser = {
    Id: 1,
    name: "Nathan Garrett",
    avatar: "NG"
  };

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
      setError("");
      setLoading(true);
      const data = await messageService.getAll();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const messageData = {
        userId: currentUser.Id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        content: newMessage.trim(),
        attachments: []
      };

      const sentMessage = await messageService.create(messageData);
      setMessages([...messages, sentMessage]);
      setNewMessage("");
      toast.success("Message sent!");
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      await messageService.addReaction(messageId, emoji, currentUser.Id, currentUser.name);
      const updatedMessages = await messageService.getAll();
      setMessages(updatedMessages);
    } catch (err) {
      toast.error("Failed to add reaction");
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      toast.info(`${files.length} file(s) selected. File sharing will be implemented in the full version.`);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
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
              <h1 className="text-2xl font-bold mb-2 font-display">Team Community</h1>
              <p className="text-green-100">Connect, share, and collaborate with your PPC team</p>
            </div>
            <div className="hidden md:block">
              <ApperIcon name="Users" size={48} className="text-green-200" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Messages Container */}
      <Card className="h-[600px] flex flex-col">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <Empty 
              title="No messages yet" 
              description="Start the conversation! Share updates, ask questions, or just say hello."
              icon="MessageCircle"
            />
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start space-x-4"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {message.userAvatar}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900">{message.userName}</span>
                    <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment, idx) => (
                          <div key={idx} className="flex items-center space-x-2 p-2 bg-white rounded border">
                            <ApperIcon name="Paperclip" className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{attachment.name}</span>
                            <span className="text-xs text-gray-400">({attachment.size})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Reactions */}
                  <div className="flex items-center space-x-2">
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex space-x-1">
                        {message.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleReaction(message.Id, reaction.emoji)}
                            className="flex items-center space-x-1 px-2 py-1 bg-white rounded-full border border-gray-200 hover:border-gray-300 transition-colors text-sm"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-gray-600">{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Quick Reactions */}
                    <div className="flex space-x-1">
                      {commonEmojis.slice(0, 3).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(message.Id, emoji)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-sm opacity-0 group-hover:opacity-100"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {currentUser.avatar}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col space-y-3">
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
                    
                    {/* Quick Emoji Buttons */}
                    <div className="flex space-x-1">
                      {commonEmojis.slice(0, 4).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setNewMessage(newMessage + emoji)}
                          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
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
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
      />
    </div>
  );
};

export default Community;