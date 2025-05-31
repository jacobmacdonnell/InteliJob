import React, { useState, useMemo } from 'react'; // Added useState, useMemo
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
  Button, // Added Button
  Flex,   // Added Flex
} from '@chakra-ui/react';
import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'; // Added Chevron icons
import type { ReportData, ReportSection } from '../types';

interface JobReportCardProps {
  data: ReportData | null;
}

// Changed props: only 'section' is needed, 'title' is part of 'section'
const SectionDisplay: React.FC<{ section: ReportSection }> = ({ section }) => {
  const [showAll, setShowAll] = useState(false); // State for Show More/Less

  const cardBg = useColorModeValue('gray.50', 'gray.750');
  const itemBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const sectionTitleColor = useColorModeValue('teal.600', 'teal.300');
  const linkColor = useColorModeValue('blue.500', 'blue.300');

  // Use section.title for the heading. Provide a fallback if title might be missing.
  const currentTitle = section?.title || "Section";

  // useMemo for sortedItems
  const sortedItems = useMemo(() => {
    if (!section?.items) return [];
    return [...section.items].sort((a, b) => b.count - a.count);
  }, [section?.items]);

  const itemsToDisplay = showAll ? sortedItems : sortedItems.slice(0, 3);

  if (!section || !section.items || section.items.length === 0) {
    return (
      <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md" mb={6}>
        <Heading as="h3" size="sm" color={sectionTitleColor} mb={2} fontWeight="semibold">
          {currentTitle}
        </Heading>
        <Text color={mutedColor}>No data available for this section.</Text>
      </Box>
    );
  }

  return (
    <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md" mb={6}>
      <Heading as="h3" size="sm" color={sectionTitleColor} mb={3} fontWeight="semibold">
        {currentTitle}
      </Heading>
      <VStack spacing={2} align="stretch"> {/* spacing changed from 3 to 2 */}
        {itemsToDisplay.map((item, index) => (
          <Box
            key={`${currentTitle}-${index}-${item.name}`}
            p={3}
            bg={itemBg}
            borderRadius="md"
            boxShadow="sm"
            _hover={{ bg: hoverBg }}
            transition="background-color 0.2s ease-in-out"
          >
            <HStack justify="space-between" align="flex-start">
              <Text fontWeight="semibold" fontSize="md" color={textColor} flex={1} mb={1}>
                {item.name}
              </Text>
              <Tag colorScheme="teal" size="sm" variant="solid">
                Found in: {item.count} job(s)
              </Tag>
            </HStack>

            {item.sources && item.sources.length > 0 && (
              <Box mt={2} pl={1}>
                <Text fontSize="xs" fontWeight="medium" color={mutedColor} mb={0.5}>
                  Mentioned in:
                </Text>
                <VStack spacing={1} align="stretch">
                  {item.sources.map((source, sourceIndex) => (
                    <HStack key={sourceIndex} spacing={2} fontSize="sm">
                      <Icon as={ExternalLinkIcon} color={linkColor} w={3} h={3} flexShrink={0} />
                      {source.job_url ? (
                        <Link
                          href={source.job_url}
                          isExternal
                          color={linkColor}
                          fontWeight="normal"
                          _hover={{ textDecoration: 'underline' }}
                          fontSize="sm"
                          lineHeight="short"
                        >
                          {source.job || 'View Job Post'} (Company: {source.company || 'N/A'})
                        </Link>
                      ) : (
                        <Text color={mutedColor} fontSize="sm" lineHeight="short">
                          {source.job || 'Job Post'} (Company: {source.company || 'N/A'}) - No direct link
                        </Text>
                      )}
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
            {(!item.sources || item.sources.length === 0) && (
                 <Text fontSize="xs" color={mutedColor} mt={2}>No specific job post links available for this item.</Text>
            )}
          </Box>
        ))}
        {sortedItems.length > 3 && (
          <Flex justifyContent="center" mt={2}>
            <Button
              size="sm"
              variant="outline"
              colorScheme="teal"
              onClick={() => setShowAll(!showAll)}
              leftIcon={showAll ? <ChevronUpIcon /> : <ChevronDownIcon />}
            >
              {showAll ? 'Show Less' : `Show All (${sortedItems.length} items)`}
            </Button>
          </Flex>
        )}
      </VStack>
    </Box>
  );
};

export const JobReportCard: React.FC<JobReportCardProps> = ({ data }) => {
  const containerBg = useColorModeValue('gray.100', 'gray.800');
  const titleColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  if (!data) {
    return (
      <Box textAlign="center" p={10} bg={containerBg}>
        <Text fontSize="lg" color={mutedColor}>No report data to display.</Text>
      </Box>
    );
  }

  // Directly use section objects from data, which include title and items
  const skillsSection = data.skills;
  const certificationsSection = data.certifications;
  const experienceSection = data.experience;

  return (
    <Box bg={containerBg} p={{ base: 3, md: 6 }} borderRadius="lg" minHeight="100vh">
      <Heading as="h2" size="md" textAlign="center" mb={5} color={titleColor}>
        Job Requirements Overview
      </Heading>

      <VStack spacing={4} align="stretch"> {/* spacing changed from 5 to 4 */}
        {/* Pass the whole section object to SectionDisplay */}
        {skillsSection && skillsSection.items.length > 0 && <SectionDisplay section={skillsSection} />}
        {certificationsSection && certificationsSection.items.length > 0 && <SectionDisplay section={certificationsSection} />}
        {experienceSection && experienceSection.items.length > 0 && <SectionDisplay section={experienceSection} />}

        {/* Fallback for sections if they might be null/undefined or empty,
            though backend now ensures they are objects with at least a title and items array.
            The SectionDisplay itself handles empty items array.
            Adding a check here to prevent rendering SectionDisplay if the whole section object is missing.
        */}
        {(!skillsSection || skillsSection.items.length === 0) &&
         (!certificationsSection || certificationsSection.items.length === 0) &&
         (!experienceSection || experienceSection.items.length === 0) &&
         (!data.total_jobs_found || data.total_jobs_found === 0) && // Check if no jobs were found at all
          <Text color={mutedColor} textAlign="center">No specific requirements data extracted from the analyzed jobs.</Text>
        }
      </VStack>
    </Box>
  );
};
