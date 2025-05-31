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
import { FaLightbulb, FaCertificate, FaTools, FaBriefcase, FaStar, FaGraduationCap } from 'react-icons/fa'; // Example icons
import type { ReportData, ExtractedItem } from '../types';

interface KeyRequirementsSnapshotProps {
  reportData: ReportData | null;
}

// Common color values for consistency
const useCommonColors = () => ({
  cardBg: useColorModeValue('white', 'gray.750'),
  borderColor: useColorModeValue('gray.200', 'gray.700'),
  hoverBg: useColorModeValue('gray.50', 'gray.700'),
  textColor: useColorModeValue('gray.700', 'gray.200'),
  subtitleColor: useColorModeValue('gray.500', 'gray.400'),
});

// Common transition styles
const commonTransition = 'all 0.2s';

// Common card styles
const cardStyles = {
  borderRadius: 'md',
  boxShadow: 'sm',
  borderWidth: '1px',
  transition: commonTransition,
  _hover: { transform: 'translateY(-1px)', boxShadow: 'md' },
};

// Format time range to match dropdown labels
const formatTimeRange = (timeRange: string): string => {
  const timeRangeMap: { [key: string]: string } = {
    '1d': 'Past 24 hours',
    '3d': 'Past 3 days',
    '7d': 'Past 7 days',
    '14d': 'Past 14 days',
    '30d': 'Past 30 days'
  };
  return timeRangeMap[timeRange] || timeRange;
};

const SnapshotSection: React.FC<{
  title: string;
  items: ExtractedItem[];
  iconAs: React.ElementType;
  colorScheme: string;
}> = ({ title, items, iconAs, colorScheme }) => {
  const colors = useCommonColors();
  const titleColor = useColorModeValue(`${colorScheme}.600`, `${colorScheme}.300`);
  const tagBg = useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`);
  const tagColor = useColorModeValue(`${colorScheme}.700`, `${colorScheme}.200`);

  if (!items || items.length === 0) {
    return null;
  }

  const topItems = items.slice(0, 3);

  return (
    <Box 
      bg={colors.cardBg}
      p={3}
      borderColor={colors.borderColor}
      {...cardStyles}
    >
      <HStack mb={2} spacing={2}>
        <Icon as={iconAs} w={4} h={4} color={titleColor} />
        <Heading size="sm" color={titleColor} fontWeight="semibold">
          {title}
        </Heading>
      </HStack>
      {topItems.length > 0 ? (
        <VStack spacing={1.5} align="stretch">
          {topItems.map((item, index) => (
            <HStack 
              key={index} 
              justify="space-between" 
              p={1.5} 
              borderRadius="md" 
              transition={commonTransition}
              _hover={{ bg: colors.hoverBg, transform: 'translateX(2px)' }}
            >
              <Text fontSize="sm" color={colors.textColor} noOfLines={1} title={item.name}>
                {item.name}
              </Text>
              <Tag 
                size="sm" 
                bg={tagBg} 
                color={tagColor} 
                fontWeight="medium" 
                borderRadius="full" 
                px={2}
                transition={commonTransition}
                _hover={{ transform: 'scale(1.05)' }}
              >
                {item.count} {item.count === 1 ? 'Job' : 'Jobs'}
              </Tag>
            </HStack>
          ))}
        </VStack>
      ) : (
        <Text fontSize="sm" color={colors.subtitleColor}>No specific items found.</Text>
      )}
    </Box>
  );
};

export const KeyRequirementsSnapshot: React.FC<KeyRequirementsSnapshotProps> = ({ reportData }) => {
  const colors = useCommonColors();
  const containerBg = useColorModeValue('gray.50', 'gray.800');
  const overallTitleColor = useColorModeValue('gray.700', 'gray.200');

  if (!reportData) {
    return null;
  }

  const { skills, certifications, experience, education } = reportData;

  const hasSkills = skills?.items && skills.items.length > 0;
  const hasCerts = certifications?.items && certifications.items.length > 0;
  const hasExp = experience?.items && experience.items.length > 0;
  const hasEdu = education?.items && education.items.length > 0;

  if (!hasSkills && !hasCerts && !hasExp && !hasEdu) {
    return (
      <Box 
        textAlign="center" 
        p={4} 
        bg={colors.cardBg}
        borderColor={colors.borderColor}
        {...cardStyles}
        mb={4}
      >
        <Icon as={FaLightbulb} w={6} h={6} color="gray.400" mb={2}/>
        <Text color={colors.subtitleColor} fontSize="sm">No key requirements identified in the report.</Text>
      </Box>
    );
  }

  return (
    <Box 
      bg={containerBg} 
      p={4} 
      borderRadius="lg" 
      mb={4} 
      boxShadow="sm"
      borderWidth="1px"
      borderColor={colors.borderColor}
    >
      <VStack align="stretch" mb={4} spacing={0.5}>
        <HStack spacing={2} alignItems="center">
          <Icon as={FaStar} w={5} h={5} color="yellow.500" />
          <Heading size="md" color={overallTitleColor} fontWeight="bold">
            {reportData.metadata.search_criteria.job_title}
            {reportData.metadata.search_criteria.location && ` in ${reportData.metadata.search_criteria.location}`}
          </Heading>
        </HStack>
        <Text fontSize="xs" color={colors.subtitleColor} pl={7}>
          {reportData.metadata.search_criteria.time_range && formatTimeRange(reportData.metadata.search_criteria.time_range)}
          {` • ${reportData.metadata.total_jobs_found} jobs analyzed`}
        </Text>
      </VStack>
      <SimpleGrid columns={1} spacing={3}>
        {hasEdu && (
          <SnapshotSection
            title={education.title || 'Education Requirements'}
            items={education.items}
            iconAs={FaGraduationCap}
            colorScheme="orange"
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
        {hasSkills && (
          <SnapshotSection
            title={skills.title || 'Top Skills'}
            items={skills.items}
            iconAs={FaTools}
            colorScheme="blue"
          />
        )}
        {hasExp && (
          <SnapshotSection
            title={experience.title || 'Top Experience'}
            items={experience.items}
            iconAs={FaBriefcase}
            colorScheme="purple"
          />
        )}
      </SimpleGrid>
    </Box>
  );
};
