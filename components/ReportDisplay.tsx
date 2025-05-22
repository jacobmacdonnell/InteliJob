import React from 'react';
import {
  Box,
  Heading,
  Text,
  List,
  ListItem,
  ListIcon,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import type { ReportData, ReportSection } from '../types';

interface ReportDisplayProps {
  data: ReportData | null;
}

const SectionCard: React.FC<{ section: ReportSection }> = ({ section }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.800');
  const itemBg = useColorModeValue('gray.100', 'rgba(45, 55, 72, 0.5)'); // gray.700 with alpha
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const titleColor = useColorModeValue('teal.600', 'teal.400');
  const borderColor = useColorModeValue('teal.300', 'teal.700');


  if (!section || section.items.length === 0) {
    return (
      <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="xl">
        <Heading as="h3" size="lg" color={titleColor} mb={3}>
          {section.title}
        </Heading>
        <Text color="gray.400">No specific data found for this section.</Text>
      </Box>
    );
  }

  return (
    <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="2xl">
      <Heading as="h3" size="lg" color={titleColor} mb={4} borderBottomWidth="2px" borderColor={borderColor} pb={2}>
        {section.title}
      </Heading>
      <List spacing={3}>
        {section.items.map((item, index) => (
          <ListItem 
            key={index} 
            display="flex" 
            alignItems="flex-start"
            bg={itemBg}
            p={3} 
            borderRadius="md" 
            boxShadow="sm"
          >
            <ListIcon as={CheckCircleIcon} color="teal.500" mt={1} mr={2} flexShrink={0} />
            <HStack justify="space-between" align="flex-start" w="full">
              <Text as="span" color={textColor} flex="1">{item.name}</Text>
              <VStack spacing={1} align="end" minW="60px">
                <Badge colorScheme="teal" variant="solid">{item.count}</Badge>
                <Text fontSize="xs" color="gray.400">{item.percentage}%</Text>
              </VStack>
            </HStack>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};


export const ReportDisplay: React.FC<ReportDisplayProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Analysis Summary */}
      <Box bg="gray.800" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="teal.500">
        <Heading as="h2" size="md" color="teal.400" mb={2}>
          Analysis Summary
        </Heading>
        <HStack spacing={6} flexWrap="wrap">
          <Text color="gray.300" fontSize="sm">
            <Text as="span" fontWeight="bold" color="white">{data.metadata.total_jobs_found}</Text> jobs found
          </Text>
          <Text color="gray.300" fontSize="sm">
            <Text as="span" fontWeight="bold" color="white">{data.metadata.jobs_with_descriptions}</Text> with descriptions analyzed
          </Text>
          <Text color="gray.300" fontSize="sm">
            Search: <Text as="span" fontWeight="bold" color="teal.300">{data.metadata.search_criteria.job_title}</Text>
            {data.metadata.search_criteria.location && (
              <Text as="span"> in <Text as="span" fontWeight="bold" color="teal.300">{data.metadata.search_criteria.location}</Text></Text>
            )}
          </Text>
        </HStack>
      </Box>

      <SectionCard section={data.skills} />
      <SectionCard section={data.certifications} />
      <SectionCard section={data.experience} />
    </VStack>
  );
};