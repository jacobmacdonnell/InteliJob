import React from 'react';
import { Box } from '@chakra-ui/react';
import { JobScanProvider } from './contexts/JobScanContext';
import ToolPage from './components/ToolPage';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <JobScanProvider>
      <Box minH="100vh" display="flex" flexDirection="column">
        <Header />
        <Box flex="1">
          <ToolPage />
        </Box>
        <Footer />
      </Box>
    </JobScanProvider>
  );
};

export default App;
