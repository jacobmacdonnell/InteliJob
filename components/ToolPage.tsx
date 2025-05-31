import React from 'react';
import {
  Box,
  VStack,
  Container,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { JobInputForm } from './JobInputForm';
import { JobReportCard } from './JobReportCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { RateLimitNotification } from './RateLimitNotification';
import { useJobScan } from '../contexts/JobScanContext';

const ToolPage: React.FC = () => {
  const { reportData, isLoading, error, handleScan } = useJobScan();
  const bgGradient = useColorModeValue(
    'linear(to-br, gray.50, blue.50)',
    'linear(to-br, gray.900, gray.800)'
  );
  const shadowColor = useColorModeValue('xl', '2xl');

  return (
    <Box 
      minH="100vh" 
      bgGradient={bgGradient}
      display="flex" 
      flexDirection="column"
    >
      {/* Rate Limit Notification */}
      <RateLimitNotification />

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
              <JobReportCard data={reportData} />
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default ToolPage; 