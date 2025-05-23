import React, { useState, useEffect, useMemo } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  CloseButton,
  Box,
  HStack,
  Icon,
  Badge,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Tooltip,
  useColorModeValue,
  Grid,
  Divider,
  Switch,
  FormHelperText,
  Flex,
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  InfoIcon, 
  StarIcon, 
  TimeIcon,
  CloseIcon
} from '@chakra-ui/icons';
import type { JobCriteria } from '../types';
import { TIME_RANGE_OPTIONS, JOB_TITLE_EXAMPLES } from '../constants';

interface JobInputFormProps {
  onSubmit: (criteria: JobCriteria) => void;
  isLoading: boolean;
}

interface SavedSearch {
  id: string;
  title: string;
  location?: string;
  time_range: string;
  timestamp: number;
}

const LocationIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </Icon>
);

const POPULAR_LOCATIONS = [
  'Remote',
  'San Francisco, CA',
  'New York, NY',
  'Seattle, WA',
  'Austin, TX',
  'Boston, MA',
  'Chicago, IL',
  'Los Angeles, CA',
  'Denver, CO',
  'Atlanta, GA'
];

const LOCATION_SUGGESTIONS = [
  ...POPULAR_LOCATIONS,
  'United States',
  'California',
  'Texas',
  'Florida',
  'Washington',
  'Massachusetts',
  'Illinois',
  'New Jersey',
  'Virginia',
  'North Carolina'
];

export const JobInputForm: React.FC<JobInputFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>(TIME_RANGE_OPTIONS[0].value);
  const [placeholderTitle, setPlaceholderTitle] = useState<string>(JOB_TITLE_EXAMPLES[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const suggestionHoverBg = useColorModeValue('gray.100', 'gray.600');
  const labelColor = useColorModeValue('gray.700', 'gray.300');

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('job-search-history');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load search history:', e);
      }
    }
  }, []);

  // Rotating placeholder animation
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderTitle(prev => {
        const currentIndex = JOB_TITLE_EXAMPLES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % JOB_TITLE_EXAMPLES.length;
        return JOB_TITLE_EXAMPLES[nextIndex];
      });
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  // Job title suggestions
  const titleSuggestions = useMemo(() => {
    if (title.length < 2) return [];
    return JOB_TITLE_EXAMPLES.filter(example => 
      example.toLowerCase().includes(title.toLowerCase()) && 
      example.toLowerCase() !== title.toLowerCase()
    ).slice(0, 5);
  }, [title]);

  // Location suggestions - simplified for instant performance
  const locationSuggestions = useMemo(() => {
    if (location.length === 0) return POPULAR_LOCATIONS.slice(0, 4);
    const filtered = LOCATION_SUGGESTIONS.filter(loc => 
      loc.toLowerCase().startsWith(location.toLowerCase()) && 
      loc.toLowerCase() !== location.toLowerCase()
    );
    return filtered.slice(0, 6);
  }, [location]);

  const saveSearch = (criteria: JobCriteria) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      title: criteria.job_title,
      location: criteria.location,
      time_range: criteria.time_range || '1d',
      timestamp: Date.now()
    };

    const updated = [newSearch, ...savedSearches.filter(s => 
      !(s.title === criteria.job_title && s.location === criteria.location)
    )].slice(0, 5); // Keep only 5 recent searches

    setSavedSearches(updated);
    localStorage.setItem('job-search-history', JSON.stringify(updated));
  };

  const loadSavedSearch = (search: SavedSearch) => {
    setTitle(search.title);
    setLocation(search.location || '');
    setTimeRange(search.time_range);
    setFormError(null);
  };

  const clearSavedSearches = () => {
    setSavedSearches([]);
    localStorage.removeItem('job-search-history');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!title.trim()) {
      setFormError("Job title is required.");
      return;
    }

    if (title.trim().length < 2) {
      setFormError("Job title must be at least 2 characters long.");
      return;
    }

    setFormError(null);
    
    const criteria = { 
      job_title: title.trim(), 
      location: location.trim() || undefined, 
      time_range: timeRange 
    };
    
    saveSearch(criteria);
    onSubmit(criteria);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} w="full" align="stretch">
        {formError && (
          <Alert status="error" borderRadius="lg" boxShadow="sm">
            <AlertIcon />
            <Box flex="1">
              {formError}
            </Box>
            <CloseButton onClick={() => setFormError(null)} position="relative" right={-1} top={-1} />
          </Alert>
        )}

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <Box>
            <HStack justify="space-between" mb={3}>
              <HStack>
                <TimeIcon w={4} h={4} color="teal.500" />
                <Text fontSize="sm" fontWeight="semibold" color={labelColor}>Recent Searches</Text>
              </HStack>
              <Button size="xs" variant="ghost" onClick={clearSavedSearches} color="gray.500">
                Clear
              </Button>
            </HStack>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
              {savedSearches.map((search) => (
                <Button
                  key={search.id}
                  size="sm"
                  variant="outline"
                  leftIcon={<StarIcon w={3} h={3} />}
                  onClick={() => loadSavedSearch(search)}
                  justifyContent="flex-start"
                  px={3}
                  textAlign="left"
                  borderColor={borderColor}
                  _hover={{ bg: suggestionHoverBg, borderColor: 'teal.300' }}
                  transition="all 0.2s"
                >
                  <VStack spacing={0} align="start" flex="1">
                    <Text fontSize="xs" fontWeight="medium" noOfLines={1}>
                      {search.title}
                    </Text>
                    {search.location && (
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>
                        {search.location}
                      </Text>
                    )}
                  </VStack>
                </Button>
              ))}
            </Grid>
          </Box>
        )}

        {/* Job Title Input */}
        <FormControl isRequired id="jobTitle" position="relative">
          <FormLabel color={labelColor} mb={3} fontWeight="semibold" fontSize="sm">
            Job Title
          </FormLabel>
          <InputGroup size="lg">
            <InputLeftElement>
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setShowSuggestions(e.target.value.length > 1);
              }}
              onFocus={() => setShowSuggestions(title.length > 1)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={`e.g., ${placeholderTitle}`}
              borderRadius="xl"
              borderWidth="2px"
              _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
              _hover={{ borderColor: 'teal.300' }}
              transition="all 0.2s"
            />
            {title && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear"
                  icon={<CloseIcon w={3} h={3} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setTitle('');
                    setShowSuggestions(false);
                  }}
                />
              </InputRightElement>
            )}
          </InputGroup>
          
          {/* Title Suggestions */}
          {showSuggestions && titleSuggestions.length > 0 && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              zIndex={10}
              bg={bg}
              border="2px solid"
              borderColor="teal.200"
              borderRadius="xl"
              mt={2}
              boxShadow="xl"
              overflow="hidden"
            >
              {titleSuggestions.map((suggestion, index) => (
                <Box
                  key={index}
                  p={4}
                  cursor="pointer"
                  _hover={{ bg: suggestionHoverBg }}
                  onClick={() => {
                    setTitle(suggestion);
                    setShowSuggestions(false);
                  }}
                  borderBottomWidth={index < titleSuggestions.length - 1 ? "1px" : "0"}
                  borderColor={borderColor}
                >
                  <Text fontSize="sm" fontWeight="medium">{suggestion}</Text>
                </Box>
              ))}
            </Box>
          )}
        </FormControl>

        {/* Location Input */}
        <FormControl id="location" position="relative">
          <FormLabel color={labelColor} mb={3} fontWeight="semibold" fontSize="sm">
            <HStack>
              <Text>Location</Text>
              <Badge variant="outline" colorScheme="teal" size="sm" borderRadius="full">Optional</Badge>
            </HStack>
          </FormLabel>
          <InputGroup size="lg">
            <InputLeftElement>
              <LocationIcon color="gray.400" w={4} h={4} />
            </InputLeftElement>
            <Input
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 100)}
              placeholder="e.g., San Francisco, CA or Remote"
              borderRadius="xl"
              borderWidth="2px"
              _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
              _hover={{ borderColor: 'teal.300' }}
              transition="border-color 0.1s ease-out"
            />
            {location && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear location"
                  icon={<CloseIcon w={3} h={3} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setLocation('');
                    setShowLocationSuggestions(false);
                  }}
                />
              </InputRightElement>
            )}
          </InputGroup>
          <FormHelperText color="gray.500" fontSize="xs">
            Leave empty to search all locations
          </FormHelperText>
          
          {/* Location Suggestions */}
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              zIndex={10}
              bg={bg}
              border="2px solid"
              borderColor="teal.200"
              borderRadius="xl"
              mt={2}
              boxShadow="xl"
              maxH="180px"
              overflowY="auto"
            >
              {locationSuggestions.map((suggestion, index) => (
                <Box
                  key={suggestion}
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: suggestionHoverBg }}
                  onClick={() => {
                    setLocation(suggestion);
                    setShowLocationSuggestions(false);
                  }}
                  borderBottomWidth={index < locationSuggestions.length - 1 ? "1px" : "0"}
                  borderColor={borderColor}
                >
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{suggestion}</Text>
                    {POPULAR_LOCATIONS.includes(suggestion) && (
                      <Badge size="xs" colorScheme="teal" variant="subtle" borderRadius="full">Popular</Badge>
                    )}
                  </HStack>
                </Box>
              ))}
            </Box>
          )}
        </FormControl>

        {/* Advanced Options Toggle */}
        <Flex justify="space-between" align="center" py={2}>
          <HStack>
            <Text fontSize="sm" fontWeight="semibold" color={labelColor}>Advanced Options</Text>
            <Tooltip label="Configure additional search parameters" placement="top">
              <InfoIcon w={3} h={3} color="gray.400" />
            </Tooltip>
          </HStack>
          <Switch
            isChecked={showAdvanced}
            onChange={(e) => setShowAdvanced(e.target.checked)}
            colorScheme="teal"
            size="md"
          />
        </Flex>

        {/* Advanced Options */}
        {showAdvanced && (
          <VStack spacing={4} align="stretch" pt={2}>
            <Divider />
            
            <FormControl id="timeRange">
              <FormLabel color={labelColor} mb={3} fontWeight="semibold" fontSize="sm">
                <HStack>
                  <Text>Date Posted</Text>
                </HStack>
              </FormLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                size="lg"
                borderRadius="xl"
                borderWidth="2px"
                _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
                _hover={{ borderColor: 'teal.300' }}
                transition="all 0.2s"
              >
                {TIME_RANGE_OPTIONS.map(option => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    style={{ backgroundColor: 'var(--chakra-colors-gray-700)', color: 'var(--chakra-colors-gray-100)'}}
                  >
                    {option.label}
                  </option>
                ))}
              </Select>
              <FormHelperText color="gray.500" fontSize="xs">
                Newer postings generally have more accurate job requirements
              </FormHelperText>
            </FormControl>
          </VStack>
        )}

        <Button
          type="submit"
          colorScheme="teal"
          isLoading={isLoading}
          loadingText="Analyzing Job Market..."
          size="lg"
          py={8}
          borderRadius="xl"
          isDisabled={isLoading || !title.trim()}
          leftIcon={<SearchIcon />}
          _active={{ transform: 'translateY(0)' }}
          transition="all 0.2s"
          fontSize="md"
          fontWeight="semibold"
          bgGradient="linear(to-r, teal.400, blue.500)"
          _hover={{ 
            bgGradient: "linear(to-r, teal.500, blue.600)",
            transform: 'translateY(-2px)',
            boxShadow: 'xl'
          }}
        >
          Analyze Job Market
        </Button>
        
        {!title.trim() && (
          <Alert status="info" borderRadius="xl" size="sm" bg={useColorModeValue('blue.50', 'blue.900')} borderColor="blue.200">
            <AlertIcon color="blue.500" />
            <Text fontSize="sm" color={useColorModeValue('blue.700', 'blue.200')}>
              Enter a job title to get started with intelligent market analysis
            </Text>
          </Alert>
        )}
      </VStack>
    </form>
  );
};