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
  HStack
} from '@chakra-ui/react';
import { JobInputForm } from './components/JobInputForm';
import { SimpleReportDisplay } from './components/SimpleReportDisplay';
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
    >
      {/* Header Section */}
      <Box
        w="full"
        bg={headerBg}
        py={3}
        px={{ base: 4, sm: 6, lg: 8 }}
        boxShadow={shadowColor}
        borderBottomWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="4xl">
          <VStack spacing={1} textAlign="center">
            <HStack align="center" spacing={3}>
              <SearchDocIcon 
                w={8} 
                h={8} 
                color="teal.500"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              />
              <Heading 
                as="h1" 
                size="xl" 
                bgGradient="linear(to-r, teal.400, blue.500)"
                bgClip="text"
                fontWeight="bold"
                letterSpacing="tight"
              >
                InteliJob
              </Heading>
              <Box 
                px={3} 
                py={1} 
                bg="orange.500" 
                color="white" 
                borderRadius="md" 
                fontSize="sm" 
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                Beta
              </Box>
            </HStack>
            <Text 
              color={useColorModeValue('gray.600', 'gray.300')}
              fontSize="md"
              fontWeight="medium"
            >
              Professional job market intelligence
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container 
        as="main" 
        maxW="4xl" 
        w="full" 
        py={2} 
        px={{ base: 4, sm: 6, lg: 8 }}
        flex={1}
      >
        <VStack spacing={2} align="stretch">
          {/* Input Form Card */}
          <Box 
            bg={useColorModeValue('white', 'gray.800')}
            p={{ base: 3, sm: 4 }} 
            borderRadius="lg" 
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
              height: '3px',
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
            <Flex justify="center" py={3}>
              <LoadingSpinner />
            </Flex>
          )}

          {/* Results Display */}
          {reportData && !isLoading && (
            <Box>
              <SimpleReportDisplay data={reportData} />
            </Box>
          )}
        </VStack>
      </Container>

      {/* Footer */}
      <Box 
        as="footer" 
        w="full"
        py={2}
        px={{ base: 4, sm: 6, lg: 8 }}
        bg={useColorModeValue('gray.50', 'gray.900')}
        borderTopWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        mt="auto"
      >
        <Container maxW="4xl">
          <HStack justify="space-between" align="center">
            <Text 
              color={useColorModeValue('gray.600', 'gray.400')} 
              fontSize="xs"
              fontWeight="normal"
            >
              &copy; {new Date().getFullYear()} InteliJob
            </Text>
            <Text 
              fontSize="xs" 
              color={useColorModeValue('gray.500', 'gray.500')}
              fontWeight="normal"
            >
              Professional job market intelligence
            </Text>
          </HStack>
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
