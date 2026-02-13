import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Container,
  Flex,
  Text,
  Tag,
  Button,
  Heading,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { FaHistory } from 'react-icons/fa';
import { JobInputForm } from './JobInputForm';
import { JobReportCard } from './JobReportCard';
import { KeyRequirementsSnapshot } from './KeyRequirementsSnapshot';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { RateLimitNotification } from './RateLimitNotification';
import { useJobScan } from '../contexts/JobScanContext';
import type { ReportData } from '../types';

// ── Compact comparison panel for saved results ──────────────────────────────
const ComparisonPanel: React.FC<{ data: ReportData }> = ({ data }) => {
  const bg = useColorModeValue('white', 'gray.750');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const percentColor = useColorModeValue('teal.600', 'teal.300');

  const certs = data.certifications?.items ? [...data.certifications.items].sort((a, b) => b.count - a.count).slice(0, 5) : [];
  const totalJobs = data.metadata?.jobs_with_descriptions || data.metadata?.total_jobs_found || 0;

  return (
    <Box
      bg={bg}
      p={4}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="bold" fontSize="sm" color={textColor}>
          {data.metadata.search_criteria.job_title}
          {data.metadata.search_criteria.location && ` in ${data.metadata.search_criteria.location}`}
        </Text>
        <Tag size="sm" colorScheme="gray" variant="subtle">
          {totalJobs} jobs
        </Tag>
      </HStack>
      {certs.length > 0 ? (
        <VStack spacing={1} align="stretch">
          {certs.map((cert, i) => (
            <HStack key={i} justify="space-between" py={0.5}>
              <HStack spacing={2}>
                <Text fontSize="xs" color={mutedColor} w="18px" textAlign="right">
                  {i + 1}.
                </Text>
                <Text fontSize="sm" color={textColor}>
                  {cert.name}
                </Text>
              </HStack>
              <Text fontSize="sm" fontWeight="semibold" color={percentColor}>
                {cert.percentage}%
              </Text>
            </HStack>
          ))}
        </VStack>
      ) : (
        <Text fontSize="sm" color={mutedColor}>No certs found</Text>
      )}
    </Box>
  );
};

// ── Main Tool Page ──────────────────────────────────────────────────────────
const ToolPage: React.FC = () => {
  const { reportData, savedResults, isLoading, error, handleScan, clearSaved } = useJobScan();
  const bgGradient = useColorModeValue(
    'linear(to-br, gray.50, blue.50)',
    'linear(to-br, gray.900, gray.800)'
  );
  const shadowColor = useColorModeValue('xl', '2xl');
  const savedBg = useColorModeValue('gray.50', 'gray.800');
  const savedBorder = useColorModeValue('gray.200', 'gray.700');
  const savedTitleColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      display="flex"
      flexDirection="column"
    >
      <RateLimitNotification />

      <Container
        as="main"
        maxW="4xl"
        w="full"
        py={2}
        px={{ base: 4, sm: 6, lg: 8 }}
        flex={1}
      >
        <VStack spacing={3} align="stretch">
          {/* Input Form */}
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

          {/* Error */}
          {error && <ErrorMessage message={error} />}

          {/* Loading */}
          {isLoading && (
            <Flex justify="center" py={3}>
              <LoadingSpinner />
            </Flex>
          )}

          {/* Current Results */}
          {reportData && !isLoading && (
            <Box>
              <KeyRequirementsSnapshot reportData={reportData} />
              <JobReportCard data={reportData} />
            </Box>
          )}

          {/* ── Saved Comparisons ── */}
          {savedResults.length > 0 && !isLoading && (
            <Box
              mt={2}
              p={4}
              bg={savedBg}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={savedBorder}
            >
              <HStack justify="space-between" mb={3}>
                <HStack spacing={2}>
                  <Icon as={FaHistory} color={savedTitleColor} w={4} h={4} />
                  <Heading size="sm" color={savedTitleColor} fontWeight="semibold">
                    Previous Searches
                  </Heading>
                </HStack>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  leftIcon={<CloseIcon w={2} h={2} />}
                  onClick={clearSaved}
                >
                  Clear
                </Button>
              </HStack>
              <VStack spacing={3} align="stretch">
                {savedResults.map((saved, index) => (
                  <ComparisonPanel key={index} data={saved} />
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default ToolPage;