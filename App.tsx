import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Container,
  Icon,
  Flex
} from '@chakra-ui/react';
import { JobInputForm } from './components/JobInputForm';
import { ReportDisplay } from './components/ReportDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { JobScanProvider, useJobScan } from './contexts/JobScanContext';

// Custom Search Icon (similar to the previous one)
const SearchDocIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z M10.5 6h3m-3 3h3m-3 3h3m-5.25 3H11.25" />
  </Icon>
);

const AppContent: React.FC = () => {
  const { reportData, isLoading, error, handleScan } = useJobScan();

  return (
    <Box minH="100vh" display="flex" flexDirection="column" alignItems="center" py={8} px={{ base: 4, sm: 6, lg: 8 }}>
      <VStack as="header" spacing={2} mb={10} textAlign="center">
        <SearchDocIcon w={16} h={16} color="teal.500" />
        <Heading as="h1" size="2xl" color="teal.400">
          InteliJob
        </Heading>
        <Text color="gray.400" mt={2} fontSize="lg">
          Uncover key requirements from job postings.
        </Text>
      </VStack>

      <Container as="main" maxW="2xl" w="full">
        <VStack spacing={8} align="stretch">
          <Box bg="gray.800" p={{ base: 6, sm: 8 }} borderRadius="xl" boxShadow="2xl">
            <JobInputForm onSubmit={handleScan} isLoading={isLoading} />
          </Box>

          {error && (
            <Box mt={6}>
              <ErrorMessage message={error} />
            </Box>
          )}
          
          {isLoading && (
            <Flex justify="center" py={10}>
              <LoadingSpinner />
            </Flex>
          )}

          {reportData && !isLoading && (
            <Box mt={6}>
              <ReportDisplay data={reportData} />
            </Box>
          )}
        </VStack>
      </Container>

      <Box as="footer" mt={16} textAlign="center" color="gray.500" fontSize="sm">
        <Text>&copy; {new Date().getFullYear()} InteliJob. All rights reserved.</Text>
        <Text fontSize="xs" mt={1}>This app is in beta testing.</Text>
      </Box>
    </Box>
  );
}


const App: React.FC = () => {
  return (
    <JobScanProvider>
      <AppContent />
    </JobScanProvider>
  );
};

export default App;
