import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { PageRenderer } from './components/PageRenderer';

const SplashScreen = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-white">
    <img src="https://raw.githubusercontent.com/Taiwojosh/Tlecc-logo/8897c8a97e20a914de0560103d5b618e5cc92fdb/tlecc.png" alt="App Logo" className="w-48 h-48 animate-pulse" />
  </div>
);

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <AppProvider>
      <Layout>
        <PageRenderer />
      </Layout>
    </AppProvider>
  );
};

export default App;