import React, { useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Link,
  Tag,
  Icon,
  useColorModeValue,
  Button,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
} from '@chakra-ui/react';
import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FaCertificate } from 'react-icons/fa';
import type { ReportData, ReportSection, ExtractedItem } from '../types';

interface JobReportCardProps {
  data: ReportData | null;
  error?: string | null;
}

// ── Cert Item Display (with full name + org) ────────────────────────────────
const CertItemDisplay: React.FC<{ item: ExtractedItem; totalJobs: number }> = ({ item, totalJobs }) => {
  const itemBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const linkColor = useColorModeValue('blue.500', 'blue.300');
  const percentColor = useColorModeValue('teal.600', 'teal.300');
  const accentBorder = useColorModeValue('teal.400', 'teal.300');
  const orgColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      p={4}
      bg={itemBg}
      borderRadius="md"
      boxShadow="sm"
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
      borderLeftWidth="4px"
      borderLeftColor={accentBorder}
    >
      <HStack justify="space-between" align="flex-start" mb={1}>
        <Box flex={1}>
          <HStack spacing={2} align="baseline">
            <Text fontWeight="bold" fontSize="lg" color={textColor}>
              {item.name}
            </Text>
            <Text fontSize="xl" fontWeight="bold" color={percentColor}>
              {item.percentage}%
            </Text>
          </HStack>
          {item.full_name && (
            <Text fontSize="sm" color={mutedColor} mt={0.5}>
              {item.full_name}
              {item.org && (
                <Text as="span" color={orgColor}> — {item.org}</Text>
              )}
            </Text>
          )}
        </Box>
        <Tag colorScheme="teal" size="sm" variant="solid" flexShrink={0}>
          {item.count} / {totalJobs} jobs
        </Tag>
      </HStack>

      {item.sources && item.sources.length > 0 && (
        <Box mt={2} pl={1}>
          <Text fontSize="xs" fontWeight="semibold" color={mutedColor} mb={1}>
            Sample job posts:
          </Text>
          <VStack spacing={1} align="stretch">
            {item.sources.slice(0, 3).map((source, i) => (
              <HStack key={i} spacing={2}>
                <Icon as={ExternalLinkIcon} color={linkColor} w={3} h={3} flexShrink={0} />
                {source.job_url ? (
                  <Link href={source.job_url} isExternal color={linkColor} fontSize="xs" _hover={{ textDecoration: 'underline' }}>
                    {source.job} ({source.company})
                  </Link>
                ) : (
                  <Text color={mutedColor} fontSize="xs">
                    {source.job} ({source.company})
                  </Text>
                )}
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

// ── Generic Section Display (for skills, experience, education) ─────────────
const SecondarySection: React.FC<{ section: ReportSection }> = ({ section }) => {
  const textColor = useColorModeValue('gray.700', 'gray.200');

  if (!section?.items || section.items.length === 0) return null;

  const sorted = [...section.items].sort((a, b) => b.count - a.count);

  return (
    <VStack spacing={1.5} align="stretch">
      {sorted.slice(0, 8).map((item, index) => (
        <HStack key={index} justify="space-between" px={2} py={1}>
          <Text fontSize="sm" color={textColor} noOfLines={1}>
            {item.name}
          </Text>
          <Tag size="sm" colorScheme="gray" variant="subtle">
            {item.count} {item.count === 1 ? 'job' : 'jobs'}
          </Tag>
        </HStack>
      ))}
    </VStack>
  );
};

// ── Main Report Card ────────────────────────────────────────────────────────
export const JobReportCard: React.FC<JobReportCardProps> = ({ data, error }) => {
  const [showAllCerts, setShowAllCerts] = useState(false);

  const containerBg = useColorModeValue('gray.50', 'gray.800');
  const titleColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const certSectionBg = useColorModeValue('white', 'gray.750');
  const certSectionBorder = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const accordionBg = useColorModeValue('white', 'gray.750');
  const accordionBorder = useColorModeValue('gray.200', 'gray.600');

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Box textAlign="center" p={10} bg={containerBg}>
        <Text fontSize="lg" color={mutedColor}>No report data to display.</Text>
      </Box>
    );
  }

  const certs = data.certifications;
  const totalJobs = data.metadata?.jobs_with_descriptions || data.metadata?.total_jobs_found || 0;
  const sortedCerts = useMemo(() =>
    certs?.items ? [...certs.items].sort((a, b) => b.count - a.count) : [],
    [certs?.items]
  );
  const certsToShow = showAllCerts ? sortedCerts : sortedCerts.slice(0, 5);

  const hasSkills = data.skills?.items?.length > 0;
  const hasExp = data.experience?.items?.length > 0;
  const hasEdu = data.education?.items?.length > 0;
  const hasSecondary = hasSkills || hasExp || hasEdu;

  return (
    <Box bg={containerBg} borderRadius="lg">
      {/* ── Header ── */}
      <Box textAlign="center" mb={4}>
        <HStack justify="center" spacing={2} mb={1}>
          <Icon as={FaCertificate} color={accentColor} w={5} h={5} />
          <Heading as="h2" size="md" color={titleColor}>
            Certification Demand
          </Heading>
        </HStack>
        <Text fontSize="sm" color={mutedColor}>
          {data.metadata.search_criteria.job_title}
          {data.metadata.search_criteria.location && ` in ${data.metadata.search_criteria.location}`}
          {' • '}{totalJobs} jobs analyzed
        </Text>
      </Box>

      {/* ── Cert Rankings (Primary) ── */}
      {sortedCerts.length > 0 ? (
        <Box
          bg={certSectionBg}
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={certSectionBorder}
          mb={4}
        >
          <VStack spacing={3} align="stretch">
            {certsToShow.map((item, index) => (
              <CertItemDisplay key={`cert-${index}-${item.name}`} item={item} totalJobs={totalJobs} />
            ))}
          </VStack>

          {sortedCerts.length > 5 && (
            <Flex justifyContent="center" mt={3}>
              <Button
                size="sm"
                variant="outline"
                colorScheme="teal"
                onClick={() => setShowAllCerts(!showAllCerts)}
                leftIcon={showAllCerts ? <ChevronUpIcon /> : <ChevronDownIcon />}
              >
                {showAllCerts ? 'Show Top 5' : `Show All (${sortedCerts.length})`}
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        <Box bg={certSectionBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={certSectionBorder} mb={4} textAlign="center">
          <Text color={mutedColor}>No certifications found in the analyzed job postings.</Text>
        </Box>
      )}

      {/* ── Secondary Sections (Collapsible) ── */}
      {hasSecondary && (
        <Accordion allowMultiple>
          {hasSkills && (
            <AccordionItem border="none" mb={2}>
              <AccordionButton bg={accordionBg} borderRadius="md" borderWidth="1px" borderColor={accordionBorder} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Text fontWeight="semibold" fontSize="sm" color={titleColor}>Top Skills</Text>
                    <Badge colorScheme="blue" fontSize="xs">{data.skills.items.length}</Badge>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={2} pt={2}>
                <SecondarySection section={data.skills} />
              </AccordionPanel>
            </AccordionItem>
          )}

          {hasExp && (
            <AccordionItem border="none" mb={2}>
              <AccordionButton bg={accordionBg} borderRadius="md" borderWidth="1px" borderColor={accordionBorder} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Text fontWeight="semibold" fontSize="sm" color={titleColor}>Experience Requirements</Text>
                    <Badge colorScheme="purple" fontSize="xs">{data.experience.items.length}</Badge>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={2} pt={2}>
                <SecondarySection section={data.experience} />
              </AccordionPanel>
            </AccordionItem>
          )}

          {hasEdu && (
            <AccordionItem border="none" mb={2}>
              <AccordionButton bg={accordionBg} borderRadius="md" borderWidth="1px" borderColor={accordionBorder} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Text fontWeight="semibold" fontSize="sm" color={titleColor}>Education Requirements</Text>
                    <Badge colorScheme="orange" fontSize="xs">{data.education.items.length}</Badge>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={2} pt={2}>
                <SecondarySection section={data.education} />
              </AccordionPanel>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </Box>
  );
};
