import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';

const Footer: React.FC = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const text = useColorModeValue('gray.400', 'gray.500');

  return (
    <Box as="footer" bg={bg} borderTopWidth="1px" borderColor={border} py={3} px={6}>
      <Text textAlign="center" fontSize="xs" color={text}>
        InteliJob — Personal cert research tool • Data from JSearch API
      </Text>
    </Box>
  );
};

export default Footer;