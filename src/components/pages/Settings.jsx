import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { userService } from '@/services/api/userService';
import { straicoService } from '@/services/api/straicoService';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';

function Settings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [validatingKey, setValidatingKey] = useState(false);
  const [keyValid, setKeyValid] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      const user = await userService.getCurrentUser();
      setCurrentUser(user);
      
      const existingApiKey = await userService.getApiKey(user.Id);
      if (existingApiKey) {
        setApiKey(existingApiKey);
        await validateAndLoadModels(existingApiKey);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load user settings');
    } finally {
      setLoading(false);
    }
  };

  const validateAndLoadModels = async (key) => {
    try {
      setValidatingKey(true);
      await userService.validateApiKey(key);
      const models = await straicoService.getAvailableModels(key);
      setAvailableModels(models);
      setKeyValid(true);
      if (models.length > 0 && !selectedModel) {
        setSelectedModel(models[0].id);
      }
    } catch (err) {
      setKeyValid(false);
      setAvailableModels([]);
      toast.error('Invalid API key or unable to fetch models');
    } finally {
      setValidatingKey(false);
    }
  };

  const handleValidateKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    await validateAndLoadModels(apiKey);
  };

  const handleSaveSettings = async () => {
    if (!keyValid) {
      toast.error('Please validate your API key first');
      return;
    }

    try {
      setSavingSettings(true);
      await userService.updateApiKey(currentUser.Id, apiKey);
      await userService.update(currentUser.Id, {
        selectedStraicoModel: selectedModel
      });
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) return <Loading type="page" />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Settings
          </h1>
          <p className="text-gray-600">
            Manage your account and AI integration settings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <ApperIcon name="User" size={24} className="text-primary mr-3" />
                <h2 className="text-xl font-display font-semibold">Profile Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={currentUser?.name || ''}
                  disabled
                  className="bg-gray-50"
                />
                <Input
                  label="Email"
                  value={currentUser?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </Card>

            {/* AI Integration Section */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <ApperIcon name="Bot" size={24} className="text-primary mr-3" />
                <h2 className="text-xl font-display font-semibold">AI Integration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Straico API Key
                  </label>
                  <div className="flex gap-3">
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your api.straico.com API key"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleValidateKey}
                      disabled={validatingKey || !apiKey.trim()}
                      className="whitespace-nowrap"
                    >
                      {validatingKey ? (
                        <>
                          <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <ApperIcon name="CheckCircle" size={16} className="mr-2" />
                          Validate
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {keyValid && (
                    <div className="flex items-center mt-2 text-sm text-secondary">
                      <ApperIcon name="CheckCircle" size={16} className="mr-2" />
                      API key validated successfully
                    </div>
                  )}
                </div>

                {availableModels.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select AI Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.provider}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {availableModels.length} models available
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSaveSettings}
                  disabled={!keyValid || savingSettings}
                  className="w-full"
                >
                  {savingSettings ? (
                    <>
                      <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Save" size={16} className="mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <ApperIcon name="Info" size={20} className="text-primary mr-2" />
                <h3 className="font-semibold">Getting Started</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">1</span>
                  <span>Get your API key from api.straico.com</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">2</span>
                  <span>Enter and validate your API key</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">3</span>
                  <span>Select your preferred AI model</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">4</span>
                  <span>Start using "Your AI" feature</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <ApperIcon name="Shield" size={20} className="text-secondary mr-2" />
                <h3 className="font-semibold">Security</h3>
              </div>
              <p className="text-sm text-gray-600">
                Your API keys are stored securely and never shared. All communications 
                with the Straico API are encrypted.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;