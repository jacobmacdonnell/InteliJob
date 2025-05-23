import React from 'react';
import { Spinner, Text, VStack, useColorModeValue } from '@chakra-ui/react';

export const LoadingSpinner: React.FC = () => {
  const textColor = useColorModeValue('teal.600', 'teal.300');
  const emptyColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <VStack spacing={2} justify="center" py={3}>
      <Spinner
        thickness="3px"
        speed="0.65s"
        emptyColor={emptyColor}
        color="teal.500"
        size="lg"
        aria-label="Loading results"
      />
      <Text color={textColor} fontSize="xs" fontWeight="medium">
        Loading results...
      </Text>
    </VStack>
  );
};