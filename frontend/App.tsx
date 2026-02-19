import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { JobScanProvider } from './contexts/JobScanContext';
import ToolPage from './components/ToolPage';
import StatsPage from './components/StatsPage';
import Header from './components/Header';
import Footer from './components/Footer';

type AppView = 'all' | 'scan' | 'stats';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('all');

  return (
    <JobScanProvider>
      <Box minH="100vh" display="flex" flexDirection="column">
        <Header activeView={activeView} onViewChange={setActiveView} />

        <Box flex="1">
          {activeView === 'all' && (
            <>
              <ToolPage />
              <Box borderTopWidth="1px" borderColor="gray.200" _dark={{ borderColor: 'gray.700' }} />
              <StatsPage />
            </>
          )}
          {activeView === 'scan' && <ToolPage />}
          {activeView === 'stats' && <StatsPage />}
        </Box>

        <Footer />
      </Box>
    </JobScanProvider>
  );
};

export default App;
