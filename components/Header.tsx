import React from 'react';
import { Box, Flex, Heading, HStack, Text, useColorModeValue } from '@chakra-ui/react';

const Header: React.FC = () => {
  const bg = useColorModeValue('white', 'gray.900');
  const border = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box as="header" w="full" bg={bg} borderBottomWidth="1px" borderColor={border} px={4} py={2} position="sticky" top={0} zIndex={100} boxShadow="sm">
      <Flex align="center" maxW="6xl" mx="auto">
        <HStack spacing={2} align="center">
          <Heading size="md" color="teal.500" letterSpacing="tight" fontWeight="bold">
            InteliJob
          </Heading>
          <Text px={2} py={0.5} bg="orange.400" color="white" borderRadius="md" fontSize="xs" fontWeight="bold" letterSpacing="wide" mt={0.5}>
            v2
          </Text>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;