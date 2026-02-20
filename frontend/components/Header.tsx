import React from 'react';
import { Box, Flex, Heading, HStack, Badge, Button, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaShieldAlt, FaSearch, FaChartLine } from 'react-icons/fa';

type TabView = 'scan' | 'trends';

interface HeaderProps {
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const title = useColorModeValue('gray.800', 'white');

  const activeStyles = {
    bg: useColorModeValue('teal.50', 'rgba(49, 151, 149, 0.2)'),
    color: useColorModeValue('teal.700', 'teal.300'),
    borderBottom: '2px solid',
    borderColor: useColorModeValue('teal.500', 'teal.300'),
  };

  const inactiveStyles = {
    color: useColorModeValue('gray.500', 'gray.400'),
    borderBottom: '2px solid transparent',
    _hover: { bg: useColorModeValue('gray.50', 'gray.700') },
  };

  const tabStyle = (tab: TabView) => (activeTab === tab ? activeStyles : inactiveStyles);

  return (
    <Box as="header" bg={bg} borderBottomWidth="1px" borderColor={border}>
      <Flex maxW="4xl" mx="auto" align="center" justify="space-between" px={6} py={2.5}>
        <HStack spacing={2.5}>
          <Icon as={FaShieldAlt} color="teal.400" w={5} h={5} />
          <Heading size="sm" color={title} fontWeight="bold" letterSpacing="tight">
            InteliJob
          </Heading>
          <Badge colorScheme="teal" variant="subtle" fontSize="2xs">v1.0.0</Badge>
        </HStack>

        <HStack spacing={0}>
          <Button
            size="sm"
            variant="ghost"
            fontWeight="medium"
            fontSize="sm"
            leftIcon={<Icon as={FaSearch} w={3.5} h={3.5} />}
            borderRadius="0"
            px={4}
            py={5}
            onClick={() => onTabChange('scan')}
            {...tabStyle('scan')}
          >
            Scan
          </Button>
          <Button
            size="sm"
            variant="ghost"
            fontWeight="medium"
            fontSize="sm"
            leftIcon={<Icon as={FaChartLine} w={3.5} h={3.5} />}
            borderRadius="0"
            px={4}
            py={5}
            onClick={() => onTabChange('trends')}
            {...tabStyle('trends')}
          >
            Trends
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
