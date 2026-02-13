import React from 'react';
import { Box, Flex, Heading, HStack, Badge, Text, useColorModeValue, Icon } from '@chakra-ui/react';
import { FaShieldAlt } from 'react-icons/fa';

const Header: React.FC = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const title = useColorModeValue('gray.800', 'white');
  const subtitle = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box as="header" bg={bg} borderBottomWidth="1px" borderColor={border} py={3} px={6}>
      <Flex maxW="3xl" mx="auto" align="center" justify="space-between">
        <HStack spacing={2.5}>
          <Icon as={FaShieldAlt} color="teal.400" w={5} h={5} />
          <Heading size="sm" color={title} fontWeight="bold" letterSpacing="tight">
            InteliJob
          </Heading>
          <Badge colorScheme="teal" variant="subtle" fontSize="2xs">v3</Badge>
        </HStack>
        <Text fontSize="xs" color={subtitle} display={{ base: 'none', sm: 'block' }}>
          Cert demand research
        </Text>
      </Flex>
    </Box>
  );
};

export default Header;