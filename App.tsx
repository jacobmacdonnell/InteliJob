import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { JobScanProvider } from './contexts/JobScanContext';
import LandingPage from './components/LandingPage';
import ToolPage from './components/ToolPage';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <JobScanProvider>
      <Router>
        <Box minH="100vh" display="flex" flexDirection="column">
          <Header />
          <Box flex="1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/app" element={<ToolPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </JobScanProvider>
  );
};

export default App;
