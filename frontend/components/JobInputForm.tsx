import React, { useState, useEffect } from 'react';
import {
  FormControl, FormLabel, Input, Select, Button, VStack,
  Box, HStack, useColorModeValue, Wrap, WrapItem, Tag, Text,
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
  const [ownedCertsInput, setOwnedCertsInput] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);

  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputText = useColorModeValue('gray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  const optionBg = useColorModeValue('#ffffff', '#2D3748');
  const optionColor = useColorModeValue('#1A202C', '#F7FAFC');
  const muted = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(i => (i + 1) % JOB_TITLE_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('rateLimitRemaining');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!Number.isNaN(parsed)) setRemainingRequests(parsed);
    }

    const handleRateUpdate = (event: Event) => {
      const e = event as CustomEvent<{ remaining: number }>;
      if (typeof e.detail?.remaining === 'number') setRemainingRequests(e.detail.remaining);
    };

    window.addEventListener('rateLimitUpdate', handleRateUpdate as EventListener);
    window.addEventListener('rateLimitWarning', handleRateUpdate as EventListener);

    return () => {
      window.removeEventListener('rateLimitUpdate', handleRateUpdate as EventListener);
      window.removeEventListener('rateLimitWarning', handleRateUpdate as EventListener);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ownedCerts = ownedCertsInput
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    onSubmit({
      job_title: title.trim(),
      location: location.trim() || undefined,
      time_range: timeRange,
      owned_certs: ownedCerts,
    });
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
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

        <Wrap spacing={2}>
          {POPULAR_SEARCHES.map((search) => (
            <WrapItem key={search}>
              <Tag
                size="sm" variant={title === search ? 'solid' : 'outline'} colorScheme="teal"
                cursor="pointer"
                onClick={() => setTitle(search)}
                _hover={{ bg: title === search ? undefined : 'teal.50', color: title === search ? undefined : 'teal.700' }}
                transition="all 0.15s"
              >
                {search}
              </Tag>
            </WrapItem>
          ))}
        </Wrap>

        <HStack spacing={3} align="start">
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

        <FormControl>
          <FormLabel color={labelColor} fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
            Certs You Already Have
          </FormLabel>
          <Input
            value={ownedCertsInput}
            onChange={(e) => setOwnedCertsInput(e.target.value)}
            placeholder="Optional — Security+, AZ-500, etc."
            bg={inputBg} color={inputText} borderColor={borderColor}
            _placeholder={{ color: placeholderColor }}
            size="md" fontSize="sm" borderRadius="md"
            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }}
          />
          <Text fontSize="xs" color={muted} mt={1}>
            Already earned? These get highlighted in your results.
          </Text>
        </FormControl>

        {remainingRequests !== null && (
          <Text fontSize="xs" color={muted}>
            API quota remaining: <strong>{remainingRequests}</strong>
          </Text>
        )}

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
