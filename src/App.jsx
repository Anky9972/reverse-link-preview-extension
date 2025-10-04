import React from 'react';
import { PreferenceProvider } from './context/PreferenceContext';
import { PreviewProvider } from './context/PreviewContext';
import { LinkPreview } from './components/content/LinkPreview';

/**
 * Main application component for the Reverse Link Preview extension
 * This component serves as the entry point for the content script
 */
const App = () => {
  return (
    <PreferenceProvider>
      <PreviewProvider>
        <LinkPreview />
      </PreviewProvider>
    </PreferenceProvider>
  );
};

export default App;