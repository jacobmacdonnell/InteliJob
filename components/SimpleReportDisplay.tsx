import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Link,
  Divider,
  Tag,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import type { ReportData, ReportSection, ExtractedItem, JobSource } from '../types';

interface SimpleReportDisplayProps {
  data: ReportData | null;
}

const SectionDisplay: React.FC<{ section: ReportSection; title: string }> = ({ section, title }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.750');
  const itemBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const sectionTitleColor = useColorModeValue('teal.600', 'teal.300');
  const linkColor = useColorModeValue('blue.500', 'blue.300');

  if (!section || !section.items || section.items.length === 0) {
    return (
      <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="md" mb={6}>
        <Heading as="h3" size="md" color={sectionTitleColor} mb={2}>
          {title}
        </Heading>
        <Text color={mutedColor}>No data available for this section.</Text>
      </Box>
    );
  }

  // Sort items by count in descending order
  const sortedItems = [...section.items].sort((a, b) => b.count - a.count);

  return (
    <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="md" mb={6}>
      <Heading as="h3" size="md" color={sectionTitleColor} mb={4}>
        {title}
      </Heading>
      <VStack spacing={4} align="stretch">
        {sortedItems.map((item, index) => (
          <Box
            key={`${title}-${index}-${item.name}`}
            p={4}
            bg={itemBg}
            borderRadius="md"
            boxShadow="sm"
            _hover={{ bg: hoverBg }}
            transition="background-color 0.2s ease-in-out"
          >
            <HStack justify="space-between" align="flex-start">
              <Text fontWeight="medium" fontSize="md" color={textColor} flex={1} mb={1}> {/* Changed fontSize to md, added mb={1} */}
                {item.name}
              </Text>
              <Tag colorScheme="teal" size="sm" variant="solid"> {/* Changed size to sm */}
                Found in: {item.count} job(s)
              </Tag>
            </HStack>

            {item.sources && item.sources.length > 0 && (
              <Box mt={2} pl={1}> {/* Adjusted mt and pl slightly */}
                <Text fontSize="sm" fontWeight="semibold" color={mutedColor} mb={1}> {/* Adjusted mb */}
                  Mentioned in:
                </Text>
                <VStack spacing={1} align="stretch"> {/* Changed spacing to 1 */}
                  {item.sources.map((source, sourceIndex) => (
                    <HStack key={sourceIndex} spacing={2} fontSize="sm"> {/* Ensured base fontSize for HStack is sm for consistency */}
                      <Icon as={ExternalLinkIcon} color={linkColor} w={3.5} h={3.5} flexShrink={0} />
                      {source.job_url ? (
                        <Link
                          href={source.job_url}
                          isExternal
                          color={linkColor}
                          fontWeight="normal" /* Changed fontWeight to normal */
                          _hover={{ textDecoration: 'underline' }}
                          fontSize="sm" /* Changed fontSize to sm */
                          lineHeight="short" // Added for better text flow with icon
                        >
                          {source.job || 'View Job Post'} (Company: {source.company || 'N/A'})
                        </Link>
                      ) : (
                        <Text color={mutedColor} fontSize="sm" lineHeight="short"> {/* Changed fontSize to sm, added lineHeight */}
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
      </VStack>
    </Box>
  );
};

export const SimpleReportDisplay: React.FC<SimpleReportDisplayProps> = ({ data }) => {
  const containerBg = useColorModeValue('gray.100', 'gray.800');
  const titleColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400'); // Added for consistency

  if (!data) {
    return (
      <Box textAlign="center" p={10} bg={containerBg}> {/* Added bg for consistency */}
        <Text fontSize="lg" color={mutedColor}>No report data to display.</Text>
      </Box>
    );
  }

  const skillsSection = data.skills || { title: "Top Skills", items: [] };
  const certificationsSection = data.certifications || { title: "Valued Certifications", items: [] };
  const experienceSection = data.experience || { title: "Experience Requirements", items: [] };


  return (
    <Box bg={containerBg} p={{ base: 3, md: 6 }} borderRadius="lg" minHeight="100vh"> {/* Added minHeight */}
      <Heading as="h2" size="lg" textAlign="center" mb={8} color={titleColor}> {/* Increased mb */}
        Job Requirements Overview
      </Heading>

      <VStack spacing={6} align="stretch"> {/* Adjusted spacing */}
        <SectionDisplay section={skillsSection} title={skillsSection.title || "Top Skills"} />
        <SectionDisplay section={certificationsSection} title={certificationsSection.title || "Valued Certifications"} />
        <SectionDisplay section={experienceSection} title={experienceSection.title || "Experience Requirements"} />
      </VStack>
    </Box>
  );
};
