import React from 'react';
import { Box, Flex, Heading, HStack, Badge, useColorModeValue } from '@chakra-ui/react';
import { FaCertificate } from 'react-icons/fa';
import { Icon } from '@chakra-ui/react';

const Header: React.FC = () => {
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const titleColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      as="header"
      bg={bg}
      borderBottomWidth="1px"
      borderColor={borderColor}
      py={3}
      px={6}
    >
      <Flex maxW="4xl" mx="auto" align="center" justify="space-between">
        <HStack spacing={2}>
          <Icon as={FaCertificate} color="teal.400" w={5} h={5} />
          <Heading size="md" color={titleColor} letterSpacing="tight">
            InteliJob
          </Heading>
          <Badge colorScheme="teal" variant="subtle" fontSize="xs">v3</Badge>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;