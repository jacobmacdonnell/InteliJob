import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  useColorModeValue
} from '@chakra-ui/react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const alertBg = useColorModeValue('red.50', 'red.900');
  const textColor = useColorModeValue('red.800', 'red.200');
  const titleColor = useColorModeValue('red.700', 'red.100');
  
  return (
    <Alert 
      status="error" 
      borderRadius="md" 
      variant="subtle"
      flexDirection={{ base: 'column', sm: 'row' }}
      alignItems="center"
      justifyContent="center"
      textAlign={{ base: 'center', sm: 'left' }}
      p={4}
      bg={alertBg}
      borderWidth="1px"
      borderColor={useColorModeValue('red.200', 'red.600')}
    >
      <AlertIcon boxSize="20px" mr={{ base: 0, sm: 2 }} mb={{ base: 1, sm: 0 }} color={useColorModeValue('red.500', 'red.300')} />
      <Box>
        <AlertTitle 
          fontWeight="semibold" 
          display="block" 
          mb={{ base: 1, sm: 0}} 
          mr={{ base: 0, sm: 2 }}
          color={titleColor}
          fontSize="sm"
        >
          Error
        </AlertTitle>
        <AlertDescription 
          display="block"
          color={textColor}
          fontSize="xs"
          fontWeight="normal"
        >
          {message}
        </AlertDescription>
      </Box>
    </Alert>
  );
};