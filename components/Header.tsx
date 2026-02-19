import React from 'react';
import { Box, Flex, Heading, HStack, Badge, Button, useColorModeValue, Icon } from '@chakra-ui/react';
import { FaShieldAlt, FaSearch, FaChartBar, FaLayerGroup } from 'react-icons/fa';

interface HeaderProps {
  activeView: 'all' | 'scan' | 'stats';
  onViewChange: (view: 'all' | 'scan' | 'stats') => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onViewChange }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const title = useColorModeValue('gray.800', 'white');
  const activeBg = useColorModeValue('teal.50', 'rgba(49, 151, 149, 0.15)');
  const activeColor = useColorModeValue('teal.700', 'teal.300');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box as="header" bg={bg} borderBottomWidth="1px" borderColor={border} py={2.5} px={6}>
      <Flex maxW="3xl" mx="auto" align="center" justify="space-between" gap={4} wrap="wrap">
        <HStack spacing={2.5}>
          <Icon as={FaShieldAlt} color="teal.400" w={5} h={5} />
          <Heading size="sm" color={title} fontWeight="bold" letterSpacing="tight">
            InteliJob
          </Heading>
          <Badge colorScheme="teal" variant="subtle" fontSize="2xs">v3</Badge>
        </HStack>

        <HStack spacing={1}>
          <Button
            size="sm"
            variant="ghost"
            fontWeight="medium"
            fontSize="sm"
            leftIcon={<Icon as={FaLayerGroup} w={3} h={3} />}
            color={activeView === 'all' ? activeColor : inactiveColor}
            bg={activeView === 'all' ? activeBg : 'transparent'}
            borderRadius="md"
            onClick={() => onViewChange('all')}
            _hover={{ bg: activeView === 'all' ? activeBg : hoverBg }}
          >
            All-in-one
          </Button>
          <Button
            size="sm"
            variant="ghost"
            fontWeight="medium"
            fontSize="sm"
            leftIcon={<Icon as={FaSearch} w={3} h={3} />}
            color={activeView === 'scan' ? activeColor : inactiveColor}
            bg={activeView === 'scan' ? activeBg : 'transparent'}
            borderRadius="md"
            onClick={() => onViewChange('scan')}
            _hover={{ bg: activeView === 'scan' ? activeBg : hoverBg }}
          >
            Scan
          </Button>
          <Button
            size="sm"
            variant="ghost"
            fontWeight="medium"
            fontSize="sm"
            leftIcon={<Icon as={FaChartBar} w={3} h={3} />}
            color={activeView === 'stats' ? activeColor : inactiveColor}
            bg={activeView === 'stats' ? activeBg : 'transparent'}
            borderRadius="md"
            onClick={() => onViewChange('stats')}
            _hover={{ bg: activeView === 'stats' ? activeBg : hoverBg }}
          >
            Stats
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
