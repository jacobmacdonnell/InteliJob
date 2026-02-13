import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  Text,
  Box,
  HStack,
  useColorModeValue,
  FormHelperText,
  Wrap,
  WrapItem,
  Tag,
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
  'Software Engineer',
];

export const JobInputForm: React.FC<JobInputFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>(TIME_RANGE_OPTIONS[0].value);
  const [placeholderTitle, setPlaceholderTitle] = useState<string>(JOB_TITLE_EXAMPLES[0]);

  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.300', 'gray.500');
  const labelColor = useColorModeValue('gray.800', 'gray.100');
  const inputBg = useColorModeValue('white', 'gray.600');
  const inputTextColor = useColorModeValue('gray.900', 'white');
  const placeholderColor = useColorModeValue('gray.500', 'gray.300');
  const helperTextColor = useColorModeValue('gray.600', 'gray.300');
  const optionBg = useColorModeValue('#ffffff', '#4A5568');
  const optionColor = useColorModeValue('#1A202C', '#F7FAFC');
  const tagBorderColor = useColorModeValue('teal.200', 'teal.600');

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderTitle(prev => {
        const currentIndex = JOB_TITLE_EXAMPLES.indexOf(prev);
        return JOB_TITLE_EXAMPLES[(currentIndex + 1) % JOB_TITLE_EXAMPLES.length];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchTitle = title.trim();
    if (!searchTitle) return;

    onSubmit({
      job_title: searchTitle,
      location: location.trim() || undefined,
      time_range: timeRange,
    });
  };

  const handleQuickSearch = (searchTerm: string) => {
    setTitle(searchTerm);
    onSubmit({
      job_title: searchTerm,
      location: location.trim() || undefined,
      time_range: timeRange,
    });
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg={bg}
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="md"
    >
      <VStack spacing={4} align="stretch">
        {/* Job Title */}
        <FormControl isRequired>
          <FormLabel color={labelColor} fontSize="sm" fontWeight="semibold">
            Job Title
          </FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`e.g. ${placeholderTitle}`}
            bg={inputBg}
            color={inputTextColor}
            borderColor={borderColor}
            _placeholder={{ color: placeholderColor }}
            size="md"
            fontSize="sm"
          />
        </FormControl>

        {/* Quick Searches */}
        <Box>
          <Text fontSize="xs" color={helperTextColor} mb={2} fontWeight="medium">
            Quick searches:
          </Text>
          <Wrap spacing={2}>
            {POPULAR_SEARCHES.map((search) => (
              <WrapItem key={search}>
                <Tag
                  size="sm"
                  variant="outline"
                  colorScheme="teal"
                  cursor="pointer"
                  borderColor={tagBorderColor}
                  onClick={() => handleQuickSearch(search)}
                  _hover={{ bg: 'teal.50', color: 'teal.700' }}
                  transition="all 0.2s"
                >
                  {search}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        <HStack spacing={4}>
          {/* Location (optional) */}
          <FormControl flex={1}>
            <FormLabel color={labelColor} fontSize="sm" fontWeight="semibold">
              Location
            </FormLabel>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Optional — e.g. Remote, New York"
              bg={inputBg}
              color={inputTextColor}
              borderColor={borderColor}
              _placeholder={{ color: placeholderColor }}
              size="md"
              fontSize="sm"
            />
          </FormControl>

          {/* Time Range */}
          <FormControl w="200px" flexShrink={0}>
            <FormLabel color={labelColor} fontSize="sm" fontWeight="semibold">
              Time Range
            </FormLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              bg={inputBg}
              color={inputTextColor}
              borderColor={borderColor}
              size="md"
              fontSize="sm"
            >
              {TIME_RANGE_OPTIONS.map(option => (
                <option
                  key={option.value}
                  value={option.value}
                  style={{ backgroundColor: optionBg, color: optionColor }}
                >
                  {option.label}
                </option>
              ))}
            </Select>
            <FormHelperText color={helperTextColor} fontSize="xs">
              Newer = more accurate
            </FormHelperText>
          </FormControl>
        </HStack>

        {/* Submit */}
        <Button
          type="submit"
          colorScheme="teal"
          size="md"
          isLoading={isLoading}
          loadingText="Analyzing ~100 jobs..."
          leftIcon={<SearchIcon />}
          fontWeight="bold"
          letterSpacing="wide"
          isDisabled={!title.trim()}
        >
          Analyze Cert Demand
        </Button>
      </VStack>
    </Box>
  );
};