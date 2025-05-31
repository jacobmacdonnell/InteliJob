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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'; // Added Chevron icons
import type { ReportData, ReportSection } from '../types';
import { KeyRequirementsSnapshot } from './KeyRequirementsSnapshot'; // Import KeyRequirementsSnapshot

interface JobReportCardProps {
  data: ReportData | null;
  error?: string | null;
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
    
    // Special sorting for education section
    if (section.title.toLowerCase().includes('education')) {
      const educationLevels = {
        'phd': 4,
        'doctorate': 4,
        'doctoral': 4,
        'master': 3,
        'm.s.': 3,
        'm.a.': 3,
        'bachelor': 2,
        'b.s.': 2,
        'b.a.': 2,
        'associate': 1,
        'a.s.': 1,
        'a.a.': 1
      };

      return [...section.items].sort((a, b) => {
        const aLevel = Object.entries(educationLevels).find(([key]) => 
          a.name.toLowerCase().includes(key))?.[1] || 0;
        const bLevel = Object.entries(educationLevels).find(([key]) => 
          b.name.toLowerCase().includes(key))?.[1] || 0;
        
        // First sort by education level
        if (aLevel !== bLevel) {
          return bLevel - aLevel;
        }
        // Then by count
        return b.count - a.count;
      });
    }
    
    // Default sorting by count for other sections
    return [...section.items].sort((a, b) => b.count - a.count);
  }, [section?.items, section?.title]);

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
            borderLeftWidth="3px"
            borderLeftColor={useColorModeValue('blue.400', 'blue.300')}
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
                <Text fontSize="sm" fontWeight="semibold" color={mutedColor} mb={1}>
                  Mentioned in:
                </Text>
                <VStack spacing={1.5} align="stretch">
                  {item.sources.map((source, sourceIndex) => (
                    <HStack key={sourceIndex} spacing={2} alignItems="flex-start"> {/* alignItems to flex-start */}
                      <Box pt={1}> {/* Adjust pt to vertically align bullet */}
                        <Box as="span" display="inline-block" borderRadius="full" width="6px" height="6px" bg={useColorModeValue('gray.400', 'gray.500')} />
                      </Box>
                      <HStack spacing={1.5} flex={1}> {/* New HStack for icon and text */}
                        <Icon as={ExternalLinkIcon} color={linkColor} w={3} h={3} flexShrink={0} mt="1px" /> {/* mt for alignment */}
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
          <Flex justifyContent="center" mt={3}>
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

export const JobReportCard: React.FC<JobReportCardProps> = ({ data, error }) => {
  const containerBg = useColorModeValue('gray.100', 'gray.800');
  const titleColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  if (error) {
    return (
      <Box textAlign="center" p={10} bg={containerBg}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

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
  const educationSection = data.education;

  return (
    <Box bg={containerBg} p={{ base: 3, md: 6 }} borderRadius="lg" minHeight="100vh">
      <Heading as="h2" size="md" textAlign="center" mb={5} color={titleColor}>
        Job Requirements Overview
      </Heading>

      <KeyRequirementsSnapshot reportData={data} /> {/* Integrated here */}

      <VStack spacing={4} align="stretch">
        {educationSection && educationSection.items.length > 0 && <SectionDisplay section={educationSection} />}
        {certificationsSection && certificationsSection.items.length > 0 && <SectionDisplay section={certificationsSection} />}
        {skillsSection && skillsSection.items.length > 0 && <SectionDisplay section={skillsSection} />}
        {experienceSection && experienceSection.items.length > 0 && <SectionDisplay section={experienceSection} />}

        {(!educationSection || educationSection.items.length === 0) &&
         (!certificationsSection || certificationsSection.items.length === 0) &&
         (!skillsSection || skillsSection.items.length === 0) &&
         (!experienceSection || experienceSection.items.length === 0) &&
         (data.metadata && (!data.metadata.total_jobs_found || data.metadata.total_jobs_found === 0)) &&
          <Text color={mutedColor} textAlign="center">No specific requirements data extracted from the analyzed jobs.</Text>
        }
      </VStack>
    </Box>
  );
};
