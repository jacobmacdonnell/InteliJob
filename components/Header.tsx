import React from 'react';
import { Box, Flex, Heading, HStack, Button, useColorModeValue, Spacer, Text } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const bg = useColorModeValue('white', 'gray.900');
  const border = useColorModeValue('gray.200', 'gray.700');
  const location = useLocation();

  return (
    <Box as="header" w="full" bg={bg} borderBottomWidth="1px" borderColor={border} px={4} py={2} position="sticky" top={0} zIndex={100} boxShadow="sm">
      <Flex align="center" maxW="6xl" mx="auto">
        <HStack spacing={2} align="center">
          <Heading as={Link} to="/" size="md" color="teal.500" letterSpacing="tight" fontWeight="bold" _hover={{ textDecoration: 'none', color: 'teal.600' }}>
            InteliJob
          </Heading>
          <Text px={2} py={0.5} bg="orange.400" color="white" borderRadius="md" fontSize="xs" fontWeight="bold" letterSpacing="wide" ml={0} mt={0.5}>
            Beta
          </Text>
        </HStack>
        <Spacer />
        <HStack spacing={2}>
          <Button as={Link} to="/" variant={location.pathname === '/' ? 'solid' : 'ghost'} colorScheme="teal" size="sm">Home</Button>
          <Button as={Link} to="/app" variant={location.pathname === '/app' ? 'solid' : 'ghost'} colorScheme="teal" size="sm">Tool</Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header; 