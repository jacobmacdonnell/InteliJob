import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Tag,
  useColorModeValue,
  Icon,
  Progress,
} from '@chakra-ui/react';
import { FaCertificate } from 'react-icons/fa';
import type { ReportData } from '../types';

interface KeyRequirementsSnapshotProps {
  reportData: ReportData | null;
}

export const KeyRequirementsSnapshot: React.FC<KeyRequirementsSnapshotProps> = ({ reportData }) => {
  const cardBg = useColorModeValue('white', 'gray.750');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const percentColor = useColorModeValue('teal.600', 'teal.300');

  if (!reportData) return null;

  const certs = reportData.certifications?.items || [];
  if (certs.length === 0) return null;

  // Show top 3 certs as headline numbers
  const topCerts = [...certs].sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <Box
      bg={cardBg}
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      mb={4}
    >
      <HStack spacing={2} mb={3}>
        <Icon as={FaCertificate} color={percentColor} w={4} h={4} />
        <Text fontSize="sm" fontWeight="bold" color={textColor}>
          Top Certifications at a Glance
        </Text>
      </HStack>
      <VStack spacing={3} align="stretch">
        {topCerts.map((cert, index) => (
          <Box key={index}>
            <HStack justify="space-between" mb={1}>
              <HStack spacing={2}>
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  {cert.name}
                </Text>
                {cert.org && (
                  <Tag size="sm" variant="subtle" colorScheme="gray" fontSize="xs">
                    {cert.org}
                  </Tag>
                )}
              </HStack>
              <Text fontSize="sm" fontWeight="bold" color={percentColor}>
                {cert.percentage}% of jobs
              </Text>
            </HStack>
            <Progress
              value={cert.percentage}
              size="xs"
              colorScheme="teal"
              borderRadius="full"
              bg={useColorModeValue('gray.100', 'gray.600')}
            />
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
