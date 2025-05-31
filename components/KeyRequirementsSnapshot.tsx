import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Tag,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaLightbulb, FaCertificate, FaUserTie, FaTools, FaBriefcase, FaStar } from 'react-icons/fa'; // Example icons
import type { ReportData, ExtractedItem, ReportSection } from '../types';

interface KeyRequirementsSnapshotProps {
  reportData: ReportData | null;
}

const SnapshotSection: React.FC<{
  title: string;
  items: ExtractedItem[];
  iconAs: React.ElementType;
  colorScheme: string;
}> = ({ title, items, iconAs, colorScheme }) => {
  const cardBg = useColorModeValue('white', 'gray.750');
  const titleColor = useColorModeValue(`${colorScheme}.600`, `${colorScheme}.300`);
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const tagBg = useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`);
  const tagColor = useColorModeValue(`${colorScheme}.700`, `${colorScheme}.200`);

  if (!items || items.length === 0) {
    return null; // Don't render section if no items
  }

  // Already sorted by count descending from JobReportCard/backend logic, take top 3
  const topItems = items.slice(0, 3);

  return (
    <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
      <HStack mb={3} spacing={3}>
        <Icon as={iconAs} w={5} h={5} color={titleColor} />
        <Heading size="sm" color={titleColor} fontWeight="semibold">
          {title}
        </Heading>
      </HStack>
      {topItems.length > 0 ? (
        <VStack spacing={2} align="stretch">
          {topItems.map((item, index) => (
            <HStack key={index} justify="space-between" p={1.5} borderRadius="md" _hover={{bg: useColorModeValue('gray.50', 'gray.700')}}>
              <Text fontSize="sm" color={textColor} noOfLines={1} title={item.name}>
                {item.name}
              </Text>
              <Tag size="sm" bg={tagBg} color={tagColor} fontWeight="bold" borderRadius="full" px={2}>
                {item.count}
              </Tag>
            </HStack>
          ))}
        </VStack>
      ) : (
        <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>No specific items found.</Text>
      )}
    </Box>
  );
};

export const KeyRequirementsSnapshot: React.FC<KeyRequirementsSnapshotProps> = ({ reportData }) => {
  const containerBg = useColorModeValue('gray.100', 'gray.800');
  const overallTitleColor = useColorModeValue('gray.700', 'gray.200');

  if (!reportData) {
    return null; // Or some loading/empty state if preferred
  }

  const { skills, certifications, experience } = reportData;

  // Check if there's any data to display in the snapshot
  const hasSkills = skills?.items && skills.items.length > 0;
  const hasCerts = certifications?.items && certifications.items.length > 0;
  const hasExp = experience?.items && experience.items.length > 0;

  if (!hasSkills && !hasCerts && !hasExp) {
    return (
        <Box textAlign="center" p={5} bg={useColorModeValue('white', 'gray.750')} borderRadius="lg" boxShadow="sm" mb={6}>
            <Icon as={FaLightbulb} w={6} h={6} color="gray.400" mb={2}/>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>No key requirements identified in the report.</Text>
        </Box>
    );
  }

  return (
    <Box bg={containerBg} p={4} borderRadius="xl" mb={6} boxShadow="lg">
      <HStack mb={4} spacing={2} alignItems="center">
        <Icon as={FaStar} w={5} h={5} color="yellow.500" />
        <Heading size="md" color={overallTitleColor} fontWeight="bold">
          Key Requirements Snapshot
        </Heading>
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {hasSkills && (
          <SnapshotSection
            title={skills.title || 'Top Skills'}
            items={skills.items}
            iconAs={FaTools}
            colorScheme="blue"
          />
        )}
        {hasCerts && (
          <SnapshotSection
            title={certifications.title || 'Top Certifications'}
            items={certifications.items}
            iconAs={FaCertificate}
            colorScheme="green"
          />
        )}
        {hasExp && (
          <SnapshotSection
            title={experience.title || 'Top Experience'}
            items={experience.items}
            iconAs={FaBriefcase} // Changed from FaUserTie
            colorScheme="purple"
          />
        )}
      </SimpleGrid>
    </Box>
  );
};
