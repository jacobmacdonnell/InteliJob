import React, { useState, useMemo } from 'react';
import {
  Box, Heading, Text, VStack, HStack, Link, Icon, Progress,
  useColorModeValue, Button, Flex, SimpleGrid, Stat, StatLabel,
  StatNumber, StatHelpText, Tag,
} from '@chakra-ui/react';
import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon, InfoIcon } from '@chakra-ui/icons';
import { FaCertificate, FaLayerGroup, FaBriefcase } from 'react-icons/fa';
import type { ReportData, CertItem, CertPair, TitleDistEntry } from '../types';

// ── Stats Summary ───────────────────────────────────────────────────────────
const StatsSummary: React.FC<{ data: ReportData }> = ({ data }) => {
  const bg = useColorModeValue('white', 'gray.750');
  const border = useColorModeValue('gray.100', 'gray.700');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const accentText = useColorModeValue('teal.600', 'teal.300');

  const totalJobs = data.metadata.jobs_with_descriptions || data.metadata.total_jobs_found;
  const totalCerts = data.certifications.items.length;
  const topCert = data.certifications.items[0];
  const queriesUsed = data.metadata.queries_used || [];

  return (
    <Box mb={4}>
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3} mb={3}>
        <Box bg={bg} p={4} borderRadius="lg" borderWidth="1px" borderColor={border}>
          <Stat size="sm">
            <StatLabel color={muted} fontSize="xs" textTransform="uppercase">Jobs Scanned</StatLabel>
            <StatNumber fontSize="2xl">{totalJobs}</StatNumber>
            <StatHelpText fontSize="xs" mb={0}>{data.metadata.search_criteria.time_range || '1d'} window</StatHelpText>
          </Stat>
        </Box>
        <Box bg={bg} p={4} borderRadius="lg" borderWidth="1px" borderColor={border}>
          <Stat size="sm">
            <StatLabel color={muted} fontSize="xs" textTransform="uppercase">Certs Found</StatLabel>
            <StatNumber fontSize="2xl">{totalCerts}</StatNumber>
            <StatHelpText fontSize="xs" mb={0}>unique certifications</StatHelpText>
          </Stat>
        </Box>
        <Box bg={bg} p={4} borderRadius="lg" borderWidth="1px" borderColor={border} display={{ base: 'none', md: 'block' }}>
          <Stat size="sm">
            <StatLabel color={muted} fontSize="xs" textTransform="uppercase">Most Requested</StatLabel>
            <StatNumber fontSize="2xl" color={accentText}>{topCert?.name || '—'}</StatNumber>
            <StatHelpText fontSize="xs" mb={0}>{topCert ? `${topCert.percentage}% of jobs` : 'no data'}</StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Queries used indicator */}
      {queriesUsed.length > 1 && (
        <HStack spacing={1.5} flexWrap="wrap">
          <Icon as={InfoIcon} color={muted} w={3} h={3} />
          <Text fontSize="xs" color={muted}>Searched:</Text>
          {queriesUsed.map((q, i) => (
            <Tag key={i} size="sm" variant="subtle" colorScheme="gray" fontSize="xs">{q}</Tag>
          ))}
        </HStack>
      )}
    </Box>
  );
};

// ── Cert Pair Insights ──────────────────────────────────────────────────────
const CertPairsPanel: React.FC<{ pairs: CertPair[] }> = ({ pairs }) => {
  const bg = useColorModeValue('white', 'gray.750');
  const border = useColorModeValue('gray.100', 'gray.700');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const text = useColorModeValue('gray.700', 'gray.200');

  if (!pairs || pairs.length === 0) return null;

  return (
    <Box bg={bg} p={4} borderRadius="lg" borderWidth="1px" borderColor={border}>
      <HStack spacing={2} mb={3}>
        <Icon as={FaLayerGroup} color="purple.400" w={3.5} h={3.5} />
        <Heading size="xs" color={text}>Cert Stacking</Heading>
        <Text fontSize="xs" color={muted}>— certs employers want together</Text>
      </HStack>
      <VStack spacing={2} align="stretch">
        {pairs.map((pair, i) => (
          <HStack key={i} spacing={2} justify="space-between">
            <HStack spacing={1.5}>
              <Tag size="sm" colorScheme="teal" variant="solid">{pair.certs[0]}</Tag>
              <Text fontSize="xs" color={muted}>+</Text>
              <Tag size="sm" colorScheme="teal" variant="solid">{pair.certs[1]}</Tag>
            </HStack>
            <Text fontSize="sm" fontWeight="semibold" color={text}>
              {pair.percentage}%
              <Text as="span" fontSize="xs" color={muted} ml={1}>({pair.count} jobs)</Text>
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

// ── Title Distribution ──────────────────────────────────────────────────────
const TitleDistPanel: React.FC<{ distribution: TitleDistEntry[] }> = ({ distribution }) => {
  const bg = useColorModeValue('white', 'gray.750');
  const border = useColorModeValue('gray.100', 'gray.700');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const text = useColorModeValue('gray.700', 'gray.200');
  const barBg = useColorModeValue('gray.100', 'gray.600');

  if (!distribution || distribution.length === 0) return null;
  const maxPct = distribution[0]?.percentage || 1;

  return (
    <Box bg={bg} p={4} borderRadius="lg" borderWidth="1px" borderColor={border}>
      <HStack spacing={2} mb={3}>
        <Icon as={FaBriefcase} color="blue.400" w={3.5} h={3.5} />
        <Heading size="xs" color={text}>Job Title Breakdown</Heading>
        <Text fontSize="xs" color={muted}>— what employers actually call these roles</Text>
      </HStack>
      <VStack spacing={2} align="stretch">
        {distribution.slice(0, 6).map((entry, i) => (
          <Box key={i}>
            <HStack justify="space-between" mb={0.5}>
              <Text fontSize="xs" color={text} noOfLines={1} maxW="70%">{entry.title}</Text>
              <Text fontSize="xs" color={muted} flexShrink={0}>{entry.percentage}% ({entry.count})</Text>
            </HStack>
            <Progress
              value={(entry.percentage / maxPct) * 100} size="xs"
              colorScheme="blue" borderRadius="full" bg={barBg}
            />
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

// ── Single Cert Row ─────────────────────────────────────────────────────────
const CertRow: React.FC<{ item: CertItem; rank: number; totalJobs: number; maxPct: number }> = ({ item, rank, totalJobs, maxPct }) => {
  const bg = useColorModeValue('white', 'gray.750');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const text = useColorModeValue('gray.800', 'gray.100');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const link = useColorModeValue('blue.500', 'blue.300');
  const pctColor = useColorModeValue('teal.600', 'teal.300');
  const rankColor = useColorModeValue('gray.400', 'gray.500');
  const barBg = useColorModeValue('gray.100', 'gray.600');
  const [expanded, setExpanded] = useState(false);

  const barPct = maxPct > 0 ? (item.percentage / maxPct) * 100 : 0;

  return (
    <Box
      bg={bg} borderRadius="md" overflow="hidden"
      _hover={{ bg: hoverBg }} transition="all 0.15s"
      cursor="pointer" onClick={() => setExpanded(!expanded)}
    >
      <Box p={3}>
        <HStack spacing={3} align="center">
          <Text fontSize="sm" fontWeight="bold" color={rankColor} w="24px" textAlign="right" flexShrink={0}>
            {rank}
          </Text>
          <Box flex={1} minW={0}>
            <HStack spacing={2} align="baseline">
              <Text fontWeight="bold" fontSize="md" color={text} noOfLines={1}>{item.name}</Text>
              {item.org && <Text fontSize="xs" color={muted} flexShrink={0}>{item.org}</Text>}
            </HStack>
            <Progress value={barPct} size="xs" colorScheme="teal" borderRadius="full" mt={1.5} bg={barBg} />
          </Box>
          <VStack spacing={0} align="end" flexShrink={0}>
            <Text fontSize="lg" fontWeight="bold" color={pctColor} lineHeight="1">{item.percentage}%</Text>
            <Text fontSize="xs" color={muted}>{item.count}/{totalJobs}</Text>
          </VStack>
        </HStack>
      </Box>

      {expanded && (
        <Box px={3} pb={3} pt={0} ml="36px">
          {item.full_name && (
            <Text fontSize="xs" color={muted} mb={1}>{item.full_name}</Text>
          )}
          {item.sources && item.sources.length > 0 && (
            <VStack spacing={0.5} align="stretch">
              {item.sources.slice(0, 3).map((source, i) => (
                <HStack key={i} spacing={1.5}>
                  <Icon as={ExternalLinkIcon} color={link} w={2.5} h={2.5} flexShrink={0} />
                  {source.job_url ? (
                    <Link
                      href={source.job_url} isExternal color={link} fontSize="xs"
                      _hover={{ textDecoration: 'underline' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {source.company}
                    </Link>
                  ) : (
                    <Text color={muted} fontSize="xs">{source.company}</Text>
                  )}
                </HStack>
              ))}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};

// ── Main Report Card ────────────────────────────────────────────────────────
export const JobReportCard: React.FC<{ data: ReportData }> = ({ data }) => {
  const [showAll, setShowAll] = useState(false);
  const titleColor = useColorModeValue('gray.700', 'gray.200');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  const accent = useColorModeValue('teal.500', 'teal.300');

  const totalJobs = data.metadata?.jobs_with_descriptions || data.metadata?.total_jobs_found || 0;
  const sorted = useMemo(
    () => data.certifications?.items ? [...data.certifications.items].sort((a, b) => b.count - a.count) : [],
    [data.certifications?.items]
  );
  const visible = showAll ? sorted : sorted.slice(0, 7);
  const maxPct = sorted.length > 0 ? sorted[0].percentage : 0;

  return (
    <VStack spacing={4} align="stretch">
      {/* Stats row */}
      <StatsSummary data={data} />

      {/* Cert Rankings */}
      <Box>
        <HStack spacing={2} mb={3}>
          <Icon as={FaCertificate} color={accent} w={4} h={4} />
          <Heading as="h2" size="sm" color={titleColor}>Certification Rankings</Heading>
        </HStack>

        {sorted.length > 0 ? (
          <Box bg={sectionBg} p={2} borderRadius="lg">
            <VStack spacing={1} align="stretch">
              {visible.map((item, i) => (
                <CertRow key={`${i}-${item.name}`} item={item} rank={i + 1} totalJobs={totalJobs} maxPct={maxPct} />
              ))}
            </VStack>
            {sorted.length > 7 && (
              <Flex justifyContent="center" mt={2}>
                <Button
                  size="xs" variant="ghost" colorScheme="teal"
                  onClick={() => setShowAll(!showAll)}
                  rightIcon={showAll ? <ChevronUpIcon /> : <ChevronDownIcon />}
                >
                  {showAll ? 'Show less' : `+${sorted.length - 7} more`}
                </Button>
              </Flex>
            )}
          </Box>
        ) : (
          <Box bg={sectionBg} p={8} borderRadius="lg" textAlign="center">
            <Text color={muted}>No certifications found in the analyzed postings.</Text>
          </Box>
        )}
      </Box>

      {/* Insights row */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
        <CertPairsPanel pairs={data.cert_pairs} />
        <TitleDistPanel distribution={data.title_distribution} />
      </SimpleGrid>
    </VStack>
  );
};
