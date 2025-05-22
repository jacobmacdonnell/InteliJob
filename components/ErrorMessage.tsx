import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box
} from '@chakra-ui/react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <Alert 
      status="error" 
      borderRadius="lg" 
      variant="subtle" // Or "solid", "left-accent", "top-accent"
      flexDirection={{ base: 'column', sm: 'row' }}
      alignItems="center"
      justifyContent="center"
      textAlign={{ base: 'center', sm: 'left' }}
      p={4}
    >
      <AlertIcon boxSize="24px" mr={{ base: 0, sm: 2 }} mb={{ base: 2, sm: 0 }}/>
      <Box>
        <AlertTitle fontWeight="bold" display="block" mb={{ base: 1, sm: 0}} mr={{ base: 0, sm: 2 }}>
          Error
        </AlertTitle>
        <AlertDescription display="block">
          {message}
        </AlertDescription>
      </Box>
    </Alert>
  );
};