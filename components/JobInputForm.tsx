import React, { useState, useEffect } from 'react';
import {
  FormControl, FormLabel, Input, Select, Button, VStack, Text,
  Box, HStack, useColorModeValue, Wrap, WrapItem, Tag,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import type { JobCriteria } from '../types';
import { TIME_RANGE_OPTIONS, JOB_TITLE_EXAMPLES } from '../constants';

interface JobInputFormProps {
  onSubmit: (criteria: JobCriteria) => void;
  isLoading: boolean;
}

const POPULAR_SEARCHES = [
  'Cybersecurity Analyst',
  'Security Engineer',
  'SOC Analyst',
  'Penetration Tester',
  'Cloud Security Engineer',
  'GRC Analyst',
];

export const JobInputForm: React.FC<JobInputFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [timeRange, setTimeRange] = useState(TIME_RANGE_OPTIONS[0].value);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputText = useColorModeValue('gray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  const optionBg = useColorModeValue('#ffffff', '#2D3748');
  const optionColor = useColorModeValue('#1A202C', '#F7FAFC');

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(i => (i + 1) % JOB_TITLE_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ job_title: title.trim(), location: location.trim() || undefined, time_range: timeRange });
  };

  // Quick search only fills the input — does NOT auto-submit
  const handleQuickFill = (term: string) => {
    setTitle(term);
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {/* Job Title */}
        <FormControl isRequired>
          <FormLabel color={labelColor} fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
            Job Title
          </FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={JOB_TITLE_EXAMPLES[placeholderIndex]}
            bg={inputBg} color={inputText} borderColor={borderColor}
            _placeholder={{ color: placeholderColor }}
            size="lg" fontSize="md" borderRadius="md"
            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }}
          />
        </FormControl>

        {/* Quick fill tags */}
        <Wrap spacing={2}>
          {POPULAR_SEARCHES.map((search) => (
            <WrapItem key={search}>
              <Tag
                size="sm" variant={title === search ? 'solid' : 'outline'} colorScheme="teal"
                cursor="pointer"
                onClick={() => handleQuickFill(search)}
                _hover={{ bg: title === search ? undefined : 'teal.50', color: title === search ? undefined : 'teal.700' }}
                transition="all 0.15s"
              >
                {search}
              </Tag>
            </WrapItem>
          ))}
        </Wrap>

        {/* Location + Time Range row */}
        <HStack spacing={3}>
          <FormControl flex={1}>
            <FormLabel color={labelColor} fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
              Location
            </FormLabel>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Optional — Remote, New York, etc."
              bg={inputBg} color={inputText} borderColor={borderColor}
              _placeholder={{ color: placeholderColor }}
              size="md" fontSize="sm" borderRadius="md"
              _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }}
            />
          </FormControl>

          <FormControl w="180px" flexShrink={0}>
            <FormLabel color={labelColor} fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
              Time Range
            </FormLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              bg={inputBg} color={inputText} borderColor={borderColor}
              size="md" fontSize="sm" borderRadius="md"
              _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }}
            >
              {TIME_RANGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} style={{ backgroundColor: optionBg, color: optionColor }}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormControl>
        </HStack>

        {/* Submit */}
        <Button
          type="submit" colorScheme="teal" size="lg"
          isLoading={isLoading} loadingText="Scanning ~100 jobs..."
          leftIcon={<SearchIcon />} fontWeight="semibold"
          isDisabled={!title.trim()}
          borderRadius="md"
          _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
          transition="all 0.2s"
        >
          Scan Cert Demand
        </Button>
      </VStack>
    </Box>
  );
};