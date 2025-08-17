import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import TextArea from '@/components/atoms/TextArea';
import Card from '@/components/atoms/Card';
import { cn } from '@/utils/cn';

const VideoUploadModal = ({ 
  isOpen, 
  onClose, 
  learningPages, 
  selectedPageId, 
  onUploadComplete 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pageId: selectedPageId || (learningPages[0]?.Id || ''),
    duration: ''
  });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/webm'];
    const maxSize = 500 * 1024 * 1024; // 500MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid video file (MP4, MOV, AVI, WMV, WebM)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 500MB');
      return;
    }

    setSelectedFile(file);
    setErrors({ ...errors, file: '' });
    
    // Auto-populate title if empty
    if (!formData.title) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setFormData({ ...formData, title: fileName });
    }

    toast.success(`Selected file: ${file.name}`);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedFile) {
      newErrors.file = 'Please select a video file';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Video title is required';
    }

    if (!formData.pageId) {
      newErrors.pageId = 'Please select a learning page';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Video duration is required (e.g., 10:30)';
    } else if (!/^\d{1,2}:\d{2}$/.test(formData.duration)) {
      newErrors.duration = 'Duration must be in MM:SS format (e.g., 10:30)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateUpload = () => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => resolve(), 500);
        }
        setUploadProgress(Math.round(progress));
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    
    try {
      // Simulate upload process
      await simulateUpload();
      
      // Create video data
      const videoData = {
        title: formData.title,
        url: `https://www.dropbox.com/s/${Date.now()}/${selectedFile.name}`,
        duration: formData.duration,
        description: formData.description,
        uploadDate: new Date().toISOString()
      };

      // Call upload complete with page ID and video data
      await onUploadComplete(parseInt(formData.pageId), videoData);
      
      toast.success(`Video "${formData.title}" uploaded successfully!`);
      handleClose();
      
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setUploadProgress(0);
      setFormData({
        title: '',
        description: '',
        pageId: selectedPageId || (learningPages[0]?.Id || ''),
        duration: ''
      });
      setErrors({});
      onClose();
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <ApperIcon name="Upload" className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold font-display">Upload Video</h2>
                    <p className="text-sm text-gray-600">Add a new video to learning pages</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  disabled={isUploading}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File *
                  </label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      dragActive ? "border-primary bg-primary/5" : "border-gray-300",
                      errors.file ? "border-red-300 bg-red-50" : "",
                      selectedFile ? "border-green-300 bg-green-50" : ""
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <ApperIcon name="Video" className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                          disabled={isUploading}
                        >
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <ApperIcon name="Upload" className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Drop your video file here
                          </p>
                          <p className="text-gray-600">
                            or click to browse your computer
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Supports MP4, MOV, AVI, WMV, WebM (max 500MB)
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleFileInputClick}
                          disabled={isUploading}
                        >
                          <ApperIcon name="FolderOpen" className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.file && (
                    <p className="text-sm text-red-600 mt-1">{errors.file}</p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Uploading...
                      </span>
                      <span className="text-sm text-gray-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-primary h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video Title *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter video title"
                      disabled={isUploading}
                      className={errors.title ? 'border-red-300' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration *
                    </label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 10:30"
                      disabled={isUploading}
                      className={errors.duration ? 'border-red-300' : ''}
                    />
                    {errors.duration && (
                      <p className="text-sm text-red-600 mt-1">{errors.duration}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Learning Page *
                  </label>
                  <select
                    value={formData.pageId}
                    onChange={(e) => handleInputChange('pageId', e.target.value)}
                    disabled={isUploading}
                    className={cn(
                      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                      errors.pageId ? 'border-red-300' : ''
                    )}
                  >
                    <option value="">Select a learning page</option>
                    {learningPages.map((page) => (
                      <option key={page.Id} value={page.Id}>
                        {page.title}
                      </option>
                    ))}
                  </select>
                  {errors.pageId && (
                    <p className="text-sm text-red-600 mt-1">{errors.pageId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <TextArea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Optional video description"
                    rows={3}
                    disabled={isUploading}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="min-w-[120px]"
                >
                  {isUploading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Upload" className="w-4 h-4" />
                      <span>Upload Video</span>
                    </div>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VideoUploadModal;