import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import VideoUploadModal from "@/components/VideoUploadModal";
import { learningService } from "@/services/api/learningService";

const Learning = () => {
const [learningPages, setLearningPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isAdmin] = useState(true); // In real app, this would come from auth context
  useEffect(() => {
    loadLearningPages();
  }, []);

  const loadLearningPages = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await learningService.getAll();
      setLearningPages(data);
      if (data.length > 0) {
        setSelectedPage(data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const handlePageSelect = (page) => {
    setSelectedPage(page);
  };

  const handleResourceClick = (resource) => {
    window.open(resource.url, '_blank');
    toast.success(`Opening ${resource.title}`);
  };

  const handleVideoClick = (video) => {
    toast.info("Video would open in embedded player");
    // In a real app, this would open the video in an embedded player
  };

  const handleVideoUpload = async (pageId, videoData) => {
    try {
      await learningService.uploadVideo(pageId, videoData);
      await loadLearningPages(); // Refresh data
      toast.success('Video uploaded and added to learning page successfully!');
    } catch (error) {
      toast.error('Failed to upload video: ' + error.message);
      throw error;
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadLearningPages} />;
  if (!learningPages.length) {
    return (
      <Empty 
        title="No learning content available" 
        description="Learning resources will appear here once they're added by an administrator."
        icon="GraduationCap"
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
      {/* Sidebar - Learning Pages List */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <Card className="p-6 h-full">
          <div className="flex items-center justify-between mb-6">
<h2 className="text-xl font-semibold font-display">Learning Pages</h2>
          <div className="flex items-center space-x-3">
            {isAdmin && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2"
                size="sm"
              >
                <ApperIcon name="Upload" className="w-4 h-4" />
                <span>Upload Video</span>
              </Button>
            )}
            <ApperIcon name="GraduationCap" className="w-6 h-6 text-primary" />
          </div>
        </div>
          
          <div className="space-y-3">
            {learningPages.map((page, index) => (
              <motion.div
                key={page.Id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handlePageSelect(page)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    selectedPage?.Id === page.Id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 line-clamp-1">{page.title}</h3>
                    <Badge variant={selectedPage?.Id === page.Id ? "primary" : "default"}>
                      {page.videoLinks.length} videos
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {page.resources.length} additional resources
                  </p>
                  <p className="text-xs text-gray-400">
                    Updated {new Date(page.lastUpdated).toLocaleDateString()}
                  </p>
                </button>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {selectedPage ? (
          <motion.div
            key={selectedPage.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Page Header */}
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 font-display">
                  {selectedPage.title}
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="primary">
                    {selectedPage.videoLinks.length} Videos
                  </Badge>
                  <Badge variant="secondary">
                    {selectedPage.resources.length} Resources
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600">
                Last updated: {new Date(selectedPage.lastUpdated).toLocaleDateString()}
              </p>
            </Card>

            {/* Training Videos Section */}
            {selectedPage.videoLinks.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 font-display flex items-center">
                  <ApperIcon name="Play" className="w-5 h-5 mr-2 text-primary" />
                  Training Videos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPage.videoLinks.map((video, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => handleVideoClick(video)}
                        className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-primary/30 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <ApperIcon name="Play" className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                              {video.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant="default" className="text-xs">
                                {video.duration}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Dropbox Video
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {/* Additional Resources Section */}
            {selectedPage.resources.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 font-display flex items-center">
                  <ApperIcon name="FileText" className="w-5 h-5 mr-2 text-secondary" />
                  Additional Resources
                </h2>
                <div className="space-y-3">
                  {selectedPage.resources.map((resource, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => handleResourceClick(resource)}
                        className="w-full p-4 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-secondary/30 transition-all duration-200 group flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                            <ApperIcon 
                              name={resource.type === 'PDF' ? 'FileText' : 'ExternalLink'} 
                              className="w-5 h-5 text-secondary" 
                            />
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-gray-900">{resource.title}</h3>
                            <p className="text-sm text-gray-500">{resource.type}</p>
                          </div>
                        </div>
                        <ApperIcon name="ExternalLink" className="w-4 h-4 text-gray-400 group-hover:text-secondary transition-colors" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        ) : (
          <Card className="p-12 text-center">
            <ApperIcon name="GraduationCap" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Select a Learning Page
            </h2>
            <p className="text-gray-500">
              Choose a topic from the sidebar to view videos and resources.
            </p>
          </Card>
        )}
</div>

      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        learningPages={learningPages}
        selectedPageId={selectedPage?.Id}
        onUploadComplete={handleVideoUpload}
      />
    </div>
  );
};

export default Learning;