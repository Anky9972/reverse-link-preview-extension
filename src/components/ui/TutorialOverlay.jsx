import React, { useState } from 'react';
import { usePreferences } from '../../context/PreferenceContext';

export const TutorialOverlay = ({ onComplete }) => {
  const { updatePreferences } = usePreferences();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Tutorial steps data
  const steps = [
    {
      title: "Welcome to Reverse Link Preview!",
      content: "This extension enhances your browsing experience by showing you previews of links before you click them. Let's go through a quick tour of its features.",
      position: "center",
    },
    {
      title: "How It Works",
      content: "Simply hover over any link on a webpage, and after a short delay, a preview will appear showing you what's behind that link.",
      position: "bottom",
      highlight: "a[href]",
    },
    {
      title: "Smart Preview Types",
      content: "The extension automatically detects content type and shows different previews for articles, images, products, videos, and social posts.",
      position: "right",
    },
    {
      title: "Detailed Preview Mode",
      content: "Hold Shift while hovering to see an enhanced preview with additional details about the link's content.",
      position: "left",
      shortcut: "Shift + Hover",
    },
    {
      title: "Customize Your Experience",
      content: "Access the extension's options through the toolbar icon to customize appearance, behavior, and site-specific settings.",
      position: "top",
    },
    {
      title: "Ready to Browse Smarter",
      content: "You're all set! Enjoy a more informed browsing experience with Reverse Link Preview. You can revisit this tutorial anytime from the options page.",
      position: "center",
    },
  ];
  
  // Handle step navigation
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Complete tutorial and mark as seen
  const completeTutorial = () => {
    updatePreferences({
      tutorialCompleted: true,
    });
    
    if (onComplete) {
      onComplete();
    }
  };
  
  // Skip tutorial
  const skipTutorial = () => {
    completeTutorial();
  };
  
  // Determine position classes based on step position
  const getPositionClasses = () => {
    const position = steps[currentStep].position;
    
    switch (position) {
      case "top":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      case "left":
        return "left-4 top-1/2 transform -translate-y-1/2";
      case "right":
        return "right-4 top-1/2 transform -translate-y-1/2";
      case "center":
      default:
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div 
        className={`bg-white rounded-lg shadow-lg p-6 max-w-md ${getPositionClasses()}`}
      >
        {/* Step indicator */}
        <div className="flex justify-center mb-4">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        {/* Step content */}
        <h2 className="text-xl font-bold mb-2">{steps[currentStep].title}</h2>
        <p className="text-gray-600 mb-4">{steps[currentStep].content}</p>
        
        {/* Shortcut indicator if available */}
        {steps[currentStep].shortcut && (
          <div className="bg-gray-100 rounded px-3 py-1 inline-block mb-4 text-sm font-mono">
            {steps[currentStep].shortcut}
          </div>
        )}
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <div>
            {currentStep > 0 && (
              <button
                onClick={goToPreviousStep}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                Back
              </button>
            )}
          </div>
          
          <div>
            <button
              onClick={skipTutorial}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded mr-2"
            >
              Skip
            </button>
            <button
              onClick={goToNextStep}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};