import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const { ApperUI } = window.ApperSDK;
            
            // Enhanced password reset with better error handling
            ApperUI.showResetPassword('#authentication-reset-password', {
                onSuccess: function(result) {
                    console.log('Password reset successful:', result);
                    setIsLoading(false);
                    // Navigate to login with success message
                    navigate('/login?message=Password reset successful. Please log in with your new password.');
                },
                onError: function(error) {
                    console.error('Password reset failed:', error);
                    setError(error.message || 'Password reset failed. Please try again.');
                    setIsLoading(false);
                }
            });
            
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to initialize password reset:', error);
            setError('Failed to load password reset form. Please refresh the page.');
            setIsLoading(false);
        }
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="flex-1 py-12 px-5 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading password reset...</p>
                </div>
            </div>
        );
    }

    return (
        <>           
            <div className="flex-1 py-12 px-5 flex justify-center items-center">
                <div className="bg-white mx-auto w-[400px] max-w-full p-10 rounded-2xl shadow-lg">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm">{error}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                    <div id="authentication-reset-password"></div>
                </div>
            </div>
        </>
    );
};
export default ResetPassword;