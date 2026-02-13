import React from 'react';
import { Box, Text, Container, useColorModeValue } from '@chakra-ui/react';

const Footer: React.FC = () => {
  const textColor = useColorModeValue('gray.500', 'gray.400');
  const bg = useColorModeValue('gray.50', 'gray.900');
  const border = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box as="footer" w="full" py={3} px={4} bg={bg} borderTopWidth="1px" borderColor={border} mt="auto">
      <Container maxW="6xl">
        <Text color={textColor} fontSize="xs" textAlign="center">
          InteliJob &mdash; Personal cert research tool &bull; Data from JSearch API
        </Text>
      </Container>
    </Box>
  );
};

export default Footer;