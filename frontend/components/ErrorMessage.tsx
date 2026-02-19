import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertDescription,
  HStack,
  useColorModeValue
} from '@chakra-ui/react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const alertBg = useColorModeValue('red.50', 'red.900');
  const textColor = useColorModeValue('red.800', 'red.200');
  
  return (
    <Alert 
      status="error" 
      borderRadius="md" 
      variant="subtle"
      p={3}
      bg={alertBg}
      borderWidth="1px"
      borderColor={useColorModeValue('red.200', 'red.600')}
      boxShadow="sm"
    >
      <HStack spacing={3} align="center" w="full">
        <AlertIcon 
          boxSize="16px" 
          color={useColorModeValue('red.500', 'red.300')}
          flexShrink={0}
        />
        <AlertDescription 
          color={textColor}
          fontSize="sm"
          fontWeight="medium"
          flex={1}
        >
          {message}
        </AlertDescription>
      </HStack>
    </Alert>
  );
};