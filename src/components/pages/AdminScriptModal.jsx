import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { scriptService } from '@/services/api/scriptService';

const AdminScriptModal = ({ show, onClose, onScriptAdded }) => {
  const [loading, setLoading] = useState(false);
  const [scriptForm, setScriptForm] = useState({
    name: '',
    description: '',
    category: '',
    link: '',
    tags: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scriptForm.name || !scriptForm.description || !scriptForm.category || !scriptForm.link) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const newScript = await scriptService.create({
        Name: scriptForm.name,
        description_c: scriptForm.description,
        category_c: scriptForm.category,
        link_c: scriptForm.link,
        Tags: scriptForm.tags
      });
      
      toast.success("Google Ads script added successfully!");
      setScriptForm({ name: '', description: '', category: '', link: '', tags: '' });
      onScriptAdded?.(newScript);
      onClose();
    } catch (err) {
      toast.error("Failed to add script. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display">Add Google Ads Script</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Script Name *
            </label>
            <Input
              value={scriptForm.name}
              onChange={(e) => setScriptForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter script name"
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
            <Input
              type="url"
              value={scriptForm.link}
              onChange={(e) => setScriptForm(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://script.google.com/d/your-script-id/edit"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <Input
              value={scriptForm.tags}
              onChange={(e) => setScriptForm(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="automation, pmax, bidding (comma separated)"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Adding..." : "Add Script"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminScriptModal;