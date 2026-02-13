import React from 'react';
import {
  Box, VStack, HStack, Container, Flex, Text, Tag,
  Heading, Icon, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Badge,
  Spinner,
} from '@chakra-ui/react';
import { FaHistory } from 'react-icons/fa';
import { JobInputForm } from './JobInputForm';
import { JobReportCard } from './JobReportCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { RateLimitNotification } from './RateLimitNotification';
import { useJobScan } from '../contexts/JobScanContext';
import type { ScanHistoryEntry } from '../types';

// ── History Table ───────────────────────────────────────────────────────────
const HistorySection: React.FC<{ history: ScanHistoryEntry[]; loading: boolean }> = ({ history, loading }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const titleColor = useColorModeValue('gray.600', 'gray.300');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const text = useColorModeValue('gray.700', 'gray.200');


  if (loading) {
    return (
      <Flex justify="center" py={6}>
        <Spinner size="sm" color="teal.400" />
      </Flex>
    );
  }

  if (history.length === 0) return null;

  return (
    <Box bg={bg} p={5} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
      <HStack spacing={2} mb={4}>
        <Icon as={FaHistory} color={titleColor} w={4} h={4} />
        <Heading size="sm" color={titleColor}>Scan History</Heading>
        <Badge colorScheme="gray" fontSize="xs">{history.length} scans</Badge>
      </HStack>

      <Box overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Search</Th>
              <Th isNumeric>Jobs</Th>
              <Th>Top Certs</Th>
            </Tr>
          </Thead>
          <Tbody>
            {history.map((entry) => {
              const date = new Date(entry.timestamp);
              const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              const topCerts = entry.cert_data.slice(0, 3);

              return (
                <Tr key={entry.id}>
                  <Td>
                    <VStack spacing={0} align="start">
                      <Text fontSize="sm" color={text}>{dateStr}</Text>
                      <Text fontSize="xs" color={muted}>{timeStr}</Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color={text} fontWeight="medium">{entry.job_title}</Text>
                    {entry.location && <Text fontSize="xs" color={muted}>{entry.location}</Text>}
                  </Td>
                  <Td isNumeric>
                    <Text fontSize="sm" color={text}>{entry.jobs_with_descriptions || entry.total_jobs}</Text>
                  </Td>
                  <Td>
                    {topCerts.length > 0 ? (
                      <HStack spacing={1} flexWrap="wrap">
                        {topCerts.map((cert, i) => (
                          <Tag key={i} size="sm" colorScheme="teal" variant="subtle">
                            {cert.name} {cert.percentage}%
                          </Tag>
                        ))}
                      </HStack>
                    ) : (
                      <Text fontSize="xs" color={muted}>No certs</Text>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

// ── Main Tool Page ──────────────────────────────────────────────────────────
const ToolPage: React.FC = () => {
  const { reportData, isLoading, error, history, historyLoading, handleScan } = useJobScan();
  const bgGradient = useColorModeValue(
    'linear(to-br, gray.50, blue.50)',
    'linear(to-br, gray.900, gray.800)'
  );
  const shadowColor = useColorModeValue('xl', '2xl');

  return (
    <Box minH="100vh" bgGradient={bgGradient} display="flex" flexDirection="column">
      <RateLimitNotification />

      <Container as="main" maxW="4xl" w="full" py={2} px={{ base: 4, sm: 6, lg: 8 }} flex={1}>
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
              top: 0, left: 0, right: 0,
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
            <JobReportCard data={reportData} />
          )}

          {/* Scan History */}
          {!isLoading && (
            <HistorySection history={history} loading={historyLoading} />
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default ToolPage;