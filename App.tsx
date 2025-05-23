import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Container,
  Icon,
  Flex,
  useColorModeValue,
  Divider
} from '@chakra-ui/react';
import { JobInputForm } from './components/JobInputForm';
import { ReportDisplay } from './components/ReportDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { JobScanProvider, useJobScan } from './contexts/JobScanContext';

// Enhanced Search Icon with better visual appeal
const SearchDocIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z M10.5 6h3m-3 3h3m-3 3h3m-5.25 3H11.25" 
    />
  </Icon>
);

const AppContent: React.FC = () => {
  const { reportData, isLoading, error, handleScan } = useJobScan();
  
  const bgGradient = useColorModeValue(
    'linear(to-br, gray.50, blue.50)',
    'linear(to-br, gray.900, gray.800)'
  );
  const headerBg = useColorModeValue('white', 'gray.800');
  const shadowColor = useColorModeValue('xl', '2xl');

  return (
    <Box 
      minH="100vh" 
      bgGradient={bgGradient}
      display="flex" 
      flexDirection="column" 
      alignItems="center"
    >
      {/* Header Section */}
      <Box
        w="full"
        bg={headerBg}
        py={8}
        px={{ base: 4, sm: 6, lg: 8 }}
        boxShadow={shadowColor}
        borderBottomWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Container maxW="4xl">
          <VStack spacing={4} textAlign="center">
            <Box position="relative">
              <SearchDocIcon 
                w={12} 
                h={12} 
                color="teal.500"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
              />
            </Box>
            <VStack spacing={2}>
              <Heading 
                as="h1" 
                size="2xl" 
                bgGradient="linear(to-r, teal.400, blue.500)"
                bgClip="text"
                fontWeight="bold"
                letterSpacing="tight"
              >
                InteliJob
              </Heading>
              <Text 
                color={useColorModeValue('gray.600', 'gray.300')}
                fontSize="lg"
                fontWeight="medium"
                maxW="md"
              >
                Transform job postings into actionable career insights
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container as="main" maxW="4xl" w="full" py={8} px={{ base: 4, sm: 6, lg: 8 }}>
        <VStack spacing={8} align="stretch">
          {/* Input Form Card */}
          <Box 
            bg={useColorModeValue('white', 'gray.800')}
            p={{ base: 6, sm: 8 }} 
            borderRadius="2xl" 
            boxShadow={shadowColor}
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              bgGradient: 'linear(to-r, teal.400, blue.500)',
            }}
          >
            <JobInputForm onSubmit={handleScan} isLoading={isLoading} />
          </Box>

          {/* Error Display */}
          {error && (
            <ErrorMessage message={error} />
          )}
          
          {/* Loading State */}
          {isLoading && (
            <Flex justify="center" py={12}>
              <LoadingSpinner />
            </Flex>
          )}

          {/* Results Display */}
          {reportData && !isLoading && (
            <Box>
              <ReportDisplay data={reportData} />
            </Box>
          )}
        </VStack>
      </Container>

      {/* Footer */}
      <Box 
        as="footer" 
        w="full"
        mt="auto"
        py={8}
        px={{ base: 4, sm: 6, lg: 8 }}
        bg={useColorModeValue('gray.50', 'gray.900')}
        borderTopWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Container maxW="4xl">
          <VStack spacing={3} textAlign="center">
            <Divider />
            <Text 
              color={useColorModeValue('gray.600', 'gray.400')} 
              fontSize="sm"
              fontWeight="medium"
            >
              &copy; {new Date().getFullYear()} InteliJob. Empowering your career journey.
            </Text>
            <Text 
              fontSize="xs" 
              color={useColorModeValue('gray.500', 'gray.500')}
            >
              Professional job market intelligence platform
            </Text>
          </VStack>
        </Container>
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
