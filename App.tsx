
import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { PageRenderer } from './components/PageRenderer';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Layout>
        <PageRenderer />
      </Layout>
    </AppProvider>
  );
};

export default App;
