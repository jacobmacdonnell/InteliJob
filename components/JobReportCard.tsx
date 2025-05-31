import React from 'react';
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
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import type { ReportData, ReportSection } from '../types';

interface JobReportCardProps { // Renamed from SimpleReportDisplayProps
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
      <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md" mb={6}> {/* p changed from 5 to 4 */}
        <Heading as="h3" size="sm" color={sectionTitleColor} mb={2} fontWeight="semibold"> {/* size sm, fontWeight semibold */}
          {title}
        </Heading>
        <Text color={mutedColor}>No data available for this section.</Text>
      </Box>
    );
  }

  const sortedItems = [...section.items].sort((a, b) => b.count - a.count);
  const top3Items = sortedItems.slice(0, 3); // Get top 3 items

  return (
    <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md" mb={6}> {/* p changed from 5 to 4 */}
      <Heading as="h3" size="sm" color={sectionTitleColor} mb={3} fontWeight="semibold"> {/* size sm, mb 3, fontWeight semibold */}
        {title}
      </Heading>
      <VStack spacing={3} align="stretch"> {/* spacing changed from 4 to 3 */}
        {top3Items.map((item, index) => ( // map over top3Items
          <Box
            key={`${title}-${index}-${item.name}`}
            p={3} // p changed from 4 to 3
            bg={itemBg}
            borderRadius="md"
            boxShadow="sm"
            _hover={{ bg: hoverBg }}
            transition="background-color 0.2s ease-in-out"
          >
            <HStack justify="space-between" align="flex-start">
              <Text fontWeight="semibold" fontSize="md" color={textColor} flex={1} mb={1}> {/* fontWeight semibold, fontSize md */}
                {item.name}
              </Text>
              <Tag colorScheme="teal" size="sm" variant="solid">
                Found in: {item.count} job(s)
              </Tag>
            </HStack>

            {item.sources && item.sources.length > 0 && (
              <Box mt={2} pl={1}>
                <Text fontSize="xs" fontWeight="medium" color={mutedColor} mb={0.5}> {/* fontSize xs, fontWeight medium, mb 0.5 */}
                  Mentioned in:
                </Text>
                <VStack spacing={1} align="stretch">
                  {item.sources.map((source, sourceIndex) => (
                    <HStack key={sourceIndex} spacing={2} fontSize="sm">
                      <Icon as={ExternalLinkIcon} color={linkColor} w={3} h={3} flexShrink={0} /> {/* w,h changed to 3 */}
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
      </VStack>
    </Box>
  );
};

export const JobReportCard: React.FC<JobReportCardProps> = ({ data }) => { // Renamed from SimpleReportDisplay
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

  const skillsSection = data.skills || { title: "Top Skills", items: [] };
  const certificationsSection = data.certifications || { title: "Valued Certifications", items: [] };
  const experienceSection = data.experience || { title: "Experience Requirements", items: [] };

  return (
    <Box bg={containerBg} p={{ base: 3, md: 6 }} borderRadius="lg" minHeight="100vh">
      <Heading as="h2" size="md" textAlign="center" mb={5} color={titleColor}> {/* size md, mb 5 */}
        Job Requirements Overview
      </Heading>

      <VStack spacing={5} align="stretch"> {/* spacing changed from 6 to 5 */}
        <SectionDisplay section={skillsSection} title={skillsSection.title || "Top Skills"} />
        <SectionDisplay section={certificationsSection} title={certificationsSection.title || "Valued Certifications"} />
        <SectionDisplay section={experienceSection} title={experienceSection.title || "Experience Requirements"} />
      </VStack>
    </Box>
  );
};
