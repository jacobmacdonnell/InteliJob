import React from 'react';
import { Box, Flex, Heading, HStack, Badge, Button, useColorModeValue, Icon } from '@chakra-ui/react';
import { FaShieldAlt, FaSearch, FaChartBar } from 'react-icons/fa';

interface HeaderProps {
  activeTab: 'scan' | 'stats';
  onTabChange: (tab: 'scan' | 'stats') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const title = useColorModeValue('gray.800', 'white');
  const activeBg = useColorModeValue('teal.50', 'rgba(49, 151, 149, 0.15)');
  const activeColor = useColorModeValue('teal.700', 'teal.300');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box as="header" bg={bg} borderBottomWidth="1px" borderColor={border} py={2.5} px={6}>
      <Flex maxW="3xl" mx="auto" align="center" justify="space-between">
        <HStack spacing={2.5}>
          <Icon as={FaShieldAlt} color="teal.400" w={5} h={5} />
          <Heading size="sm" color={title} fontWeight="bold" letterSpacing="tight">
            InteliJob
          </Heading>
          <Badge colorScheme="teal" variant="subtle" fontSize="2xs">v3</Badge>
        </HStack>

        {/* Tab buttons */}
        <HStack spacing={1}>
          <Button
            size="sm" variant="ghost" fontWeight="medium" fontSize="sm"
            leftIcon={<Icon as={FaSearch} w={3} h={3} />}
            color={activeTab === 'scan' ? activeColor : inactiveColor}
            bg={activeTab === 'scan' ? activeBg : 'transparent'}
            borderRadius="md"
            onClick={() => onTabChange('scan')}
            _hover={{ bg: activeTab === 'scan' ? activeBg : useColorModeValue('gray.100', 'gray.700') }}
          >
            Scan
          </Button>
          <Button
            size="sm" variant="ghost" fontWeight="medium" fontSize="sm"
            leftIcon={<Icon as={FaChartBar} w={3} h={3} />}
            color={activeTab === 'stats' ? activeColor : inactiveColor}
            bg={activeTab === 'stats' ? activeBg : 'transparent'}
            borderRadius="md"
            onClick={() => onTabChange('stats')}
            _hover={{ bg: activeTab === 'stats' ? activeBg : useColorModeValue('gray.100', 'gray.700') }}
          >
            Stats
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;