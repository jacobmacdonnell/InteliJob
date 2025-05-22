import React from 'react';
import { Spinner, Text, VStack } from '@chakra-ui/react';

export const LoadingSpinner: React.FC = () => {
  return (
    <VStack spacing={3} justify="center" py={5}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.600"
        color="teal.500"
        size="xl"
        aria-label="Loading results"
      />
      <Text color="teal.400" fontSize="sm">
        Loading results...
      </Text>
    </VStack>
  );
};