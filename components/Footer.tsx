import React from 'react';
import { Box, Text, HStack, Button, Container, Stack, useColorModeValue } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const bg = useColorModeValue('gray.100', 'gray.900');
  const border = useColorModeValue('gray.200', 'gray.700');
  return (
    <Box as="footer" w="full" py={4} px={4} bg={bg} borderTopWidth="1px" borderColor={border} mt="auto">
      <Container maxW="6xl">
        <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
          <HStack spacing={2} align="center">
            <Text color={textColor} fontSize="sm" fontWeight="bold">InteliJob</Text>
            <Text px={2} py={0.5} bg="orange.400" color="white" borderRadius="md" fontSize="xs" fontWeight="bold" letterSpacing="wide" ml={0} mt={0.5}>
              Beta
            </Text>
            <Text color={textColor} fontSize="sm">&copy; {new Date().getFullYear()} All rights reserved.</Text>
          </HStack>
          <HStack spacing={4}>
            <Button as={Link} to="/app" colorScheme="teal" variant="ghost" size="sm">Tool</Button>
            <Button as={Link} to="/" colorScheme="teal" variant="ghost" size="sm">Home</Button>
          </HStack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer; 