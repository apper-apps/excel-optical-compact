import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { userService } from '@/services/api/userService';
import { straicoService } from '@/services/api/straicoService';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';

function YourAI() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [querying, setQuerying] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const responseRef = useRef(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await userService.getCurrentUser();
      setCurrentUser(user);
      
      const userApiKey = await userService.getApiKey(user.Id);
      if (!userApiKey) {
        setError('No API key configured. Please go to Settings to set up your Straico API key.');
        return;
      }
      
      setApiKey(userApiKey);
      setSelectedModel(user.selectedStraicoModel);
      
      if (!user.selectedStraicoModel) {
        setError('No AI model selected. Please go to Settings to select a model.');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load AI configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    try {
      setQuerying(true);
      setResponse('');
      
      const result = await straicoService.query(apiKey, selectedModel, query, conversationHistory);
      setResponse(result.response);
      
      const newConversation = [
        ...conversationHistory,
        { role: 'user', content: query },
        { role: 'assistant', content: result.response }
      ];
      setConversationHistory(newConversation);
      setQuery('');
      
      toast.success('Query completed successfully');
    } catch (err) {
      toast.error('Failed to query AI model: ' + err.message);
    } finally {
      setQuerying(false);
    }
  };

  const handleCopyResponse = async () => {
    if (!response) {
      toast.error('No response to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(response);
      toast.success('Response copied to clipboard as markdown');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleClearHistory = () => {
    setConversationHistory([]);
    setResponse('');
    toast.info('Conversation history cleared');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleQuery();
    }
  };

  if (loading) return <Loading type="page" />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                Your AI
              </h1>
              <p className="text-gray-600">
                Query your connected AI model and get markdown-formatted responses
              </p>
            </div>
            <div className="flex items-center gap-4">
              {conversationHistory.length > 0 && (
                <Button
                  onClick={handleClearHistory}
                  variant="outline"
                  size="sm"
                >
                  <ApperIcon name="Trash2" size={16} className="mr-2" />
                  Clear History
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Query Input */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <ApperIcon name="MessageSquare" size={24} className="text-primary mr-3" />
                <h2 className="text-xl font-display font-semibold">Query AI Model</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Question or Prompt
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your AI model anything... (Ctrl/Cmd + Enter to send)"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Press Ctrl/Cmd + Enter to send your query
                  </p>
                </div>

                <Button
                  onClick={handleQuery}
                  disabled={querying || !query.trim()}
                  className="w-full"
                >
                  {querying ? (
                    <>
                      <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                      Querying AI...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Send" size={16} className="mr-2" />
                      Send Query
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Response */}
            {(response || querying) && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <ApperIcon name="Bot" size={24} className="text-secondary mr-3" />
                    <h2 className="text-xl font-display font-semibold">AI Response</h2>
                  </div>
                  {response && (
                    <Button
                      onClick={handleCopyResponse}
                      variant="outline"
                      size="sm"
                    >
                      <ApperIcon name="Copy" size={16} className="mr-2" />
                      Copy Markdown
                    </Button>
                  )}
                </div>

                <div 
                  ref={responseRef}
                  className="bg-gray-50 rounded-lg p-4 min-h-[200px] font-mono text-sm whitespace-pre-wrap"
                >
                  {querying ? (
                    <div className="flex items-center justify-center h-32">
                      <ApperIcon name="Loader2" size={24} className="animate-spin text-primary" />
                    </div>
                  ) : (
                    response || "No response yet. Send a query to get started."
                  )}
                </div>
              </Card>
            )}

            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <ApperIcon name="History" size={24} className="text-gray-600 mr-3" />
                  <h2 className="text-xl font-display font-semibold">Conversation History</h2>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conversationHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-3xl p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="flex items-center mb-1">
                          <ApperIcon 
                            name={message.role === 'user' ? 'User' : 'Bot'} 
                            size={16} 
                            className="mr-2" 
                          />
                          <span className="text-xs font-medium">
                            {message.role === 'user' ? 'You' : 'AI'}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <ApperIcon name="Settings" size={20} className="text-primary mr-2" />
                <h3 className="font-semibold">Current Setup</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Model:</span>
                  <p className="font-medium">{selectedModel || 'Not configured'}</p>
                </div>
                <div>
                  <span className="text-gray-600">API Status:</span>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                    <span className="text-secondary font-medium">Connected</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Queries Today:</span>
                  <p className="font-medium">{conversationHistory.filter(m => m.role === 'user').length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <ApperIcon name="Lightbulb" size={20} className="text-warning mr-2" />
                <h3 className="font-semibold">Quick Tips</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <ApperIcon name="ArrowRight" size={14} className="mr-2 mt-0.5 text-primary" />
                  <span>Use Ctrl/Cmd + Enter to send queries quickly</span>
                </div>
                <div className="flex items-start">
                  <ApperIcon name="ArrowRight" size={14} className="mr-2 mt-0.5 text-primary" />
                  <span>Responses are formatted in markdown for easy copying</span>
                </div>
                <div className="flex items-start">
                  <ApperIcon name="ArrowRight" size={14} className="mr-2 mt-0.5 text-primary" />
                  <span>Conversation history helps maintain context</span>
                </div>
                <div className="flex items-start">
                  <ApperIcon name="ArrowRight" size={14} className="mr-2 mt-0.5 text-primary" />
                  <span>Clear history to start fresh conversations</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <ApperIcon name="ExternalLink" size={20} className="text-gray-600 mr-2" />
                <h3 className="font-semibold">Need Help?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Configure your API key and model selection in Settings.
              </p>
              <Button
                onClick={() => window.location.href = '/settings'}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <ApperIcon name="Settings" size={16} className="mr-2" />
                Go to Settings
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YourAI;