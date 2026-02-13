import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { JobScanProvider } from './contexts/JobScanContext';
import ToolPage from './components/ToolPage';
import StatsPage from './components/StatsPage';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'stats'>('scan');

  return (
    <JobScanProvider>
      <Box minH="100vh" display="flex" flexDirection="column">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <Box flex="1">
          {activeTab === 'scan' ? <ToolPage /> : <StatsPage />}
        </Box>
        <Footer />
      </Box>
    </JobScanProvider>
  );
};

export default App;
