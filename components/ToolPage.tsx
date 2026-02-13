import React from 'react';
import {
  Box, VStack, HStack, Container, Flex, Text, Tag,
  Heading, Icon, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Spinner, Tooltip,
} from '@chakra-ui/react';
import { FaHistory } from 'react-icons/fa';
import { JobInputForm } from './JobInputForm';
import { JobReportCard } from './JobReportCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { RateLimitNotification } from './RateLimitNotification';
import { useJobScan } from '../contexts/JobScanContext';
import type { ScanHistoryEntry } from '../types';

// ── History Section ─────────────────────────────────────────────────────────
const HistorySection: React.FC<{ history: ScanHistoryEntry[]; loading: boolean }> = ({ history, loading }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const titleColor = useColorModeValue('gray.600', 'gray.300');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const text = useColorModeValue('gray.700', 'gray.200');
  const rowHover = useColorModeValue('gray.50', 'gray.750');

  if (loading) {
    return <Flex justify="center" py={6}><Spinner size="sm" color="teal.400" /></Flex>;
  }
  if (history.length === 0) return null;

  // Group by date
  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <Box bg={bg} p={4} borderRadius="lg" borderWidth="1px" borderColor={border}>
      <HStack spacing={2} mb={3}>
        <Icon as={FaHistory} color={titleColor} w={3.5} h={3.5} />
        <Heading size="xs" color={titleColor} textTransform="uppercase" letterSpacing="wider">
          Scan History
        </Heading>
        <Badge colorScheme="gray" fontSize="2xs" variant="subtle">{history.length}</Badge>
      </HStack>

      <Box overflowX="auto" mx={-2}>
        <Table size="sm" variant="unstyled">
          <Thead>
            <Tr>
              <Th color={muted} fontSize="2xs" textTransform="uppercase" px={2} pb={2}>When</Th>
              <Th color={muted} fontSize="2xs" textTransform="uppercase" px={2} pb={2}>Search</Th>
              <Th color={muted} fontSize="2xs" textTransform="uppercase" px={2} pb={2} isNumeric>Jobs</Th>
              <Th color={muted} fontSize="2xs" textTransform="uppercase" px={2} pb={2}>Top Certifications</Th>
            </Tr>
          </Thead>
          <Tbody>
            {history.map((entry) => {
              const topCerts = entry.cert_data
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, 3);

              return (
                <Tr key={entry.id} _hover={{ bg: rowHover }} transition="background 0.1s">
                  <Td px={2} py={2} verticalAlign="top">
                    <Text fontSize="sm" color={text} fontWeight="medium">{formatDate(entry.timestamp)}</Text>
                    <Text fontSize="xs" color={muted}>{formatTime(entry.timestamp)}</Text>
                  </Td>
                  <Td px={2} py={2} verticalAlign="top">
                    <Text fontSize="sm" color={text} fontWeight="medium">{entry.job_title}</Text>
                    {entry.location && <Text fontSize="xs" color={muted}>{entry.location}</Text>}
                  </Td>
                  <Td px={2} py={2} isNumeric verticalAlign="top">
                    <Text fontSize="sm" color={text}>{entry.jobs_with_descriptions || entry.total_jobs}</Text>
                  </Td>
                  <Td px={2} py={2} verticalAlign="top">
                    {topCerts.length > 0 ? (
                      <HStack spacing={1.5} flexWrap="wrap">
                        {topCerts.map((cert, i) => (
                          <Tooltip key={i} label={`${cert.full_name || cert.name} — ${cert.percentage}% of jobs`} fontSize="xs">
                            <Tag
                              size="sm" colorScheme={i === 0 ? 'teal' : 'gray'}
                              variant={i === 0 ? 'solid' : 'subtle'}
                              fontSize="xs"
                            >
                              {cert.name} {cert.percentage}%
                            </Tag>
                          </Tooltip>
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

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box minH="100vh" bg={pageBg}>
      <RateLimitNotification />

      <Container as="main" maxW="3xl" w="full" py={6} px={{ base: 4, sm: 6 }}>
        <VStack spacing={4} align="stretch">
          {/* Search Card */}
          <Box
            bg={cardBg} p={5} borderRadius="xl"
            borderWidth="1px" borderColor={cardBorder}
            boxShadow="sm"
          >
            <JobInputForm onSubmit={handleScan} isLoading={isLoading} />
          </Box>

          {/* Error */}
          {error && <ErrorMessage message={error} />}

          {/* Loading */}
          {isLoading && (
            <Flex justify="center" py={8}>
              <VStack spacing={3}>
                <LoadingSpinner />
                <Text fontSize="sm" color="gray.400">Scanning ~100 job postings...</Text>
              </VStack>
            </Flex>
          )}

          {/* Results */}
          {reportData && !isLoading && (
            <Box
              bg={cardBg} p={5} borderRadius="xl"
              borderWidth="1px" borderColor={cardBorder}
              boxShadow="sm"
            >
              <JobReportCard data={reportData} />
            </Box>
          )}

          {/* History */}
          {!isLoading && (
            <HistorySection history={history} loading={historyLoading} />
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default ToolPage;