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
  IconButton,
  useColorModeValue,
  Grid,
  FormHelperText,
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  StarIcon, 
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

const POPULAR_SEARCHES = [
  'Software Engineer',
  'Data Scientist', 
  'Product Manager',
  'UX Designer',
  'DevOps Engineer',
  'Marketing Manager'
];

const FALLBACK_LOCATIONS = [
  'Remote',
  'New York, NY',
  'San Francisco, CA',
  'Los Angeles, CA',
  'Chicago, IL',
  'Austin, TX'
];

// Province/State mappings for proper abbreviations
const CANADIAN_PROVINCES: { [key: string]: string } = {
  'Alberta': 'AB',
  'British Columbia': 'BC',
  'Manitoba': 'MB',
  'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL',
  'Northwest Territories': 'NT',
  'Nova Scotia': 'NS',
  'Nunavut': 'NU',
  'Ontario': 'ON',
  'Prince Edward Island': 'PE',
  'Quebec': 'QC',
  'Saskatchewan': 'SK',
  'Yukon': 'YT'
};

const US_STATES: { [key: string]: string } = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'District of Columbia': 'DC'
};

export const JobInputForm: React.FC<JobInputFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>(TIME_RANGE_OPTIONS[0].value);
  const [placeholderTitle, setPlaceholderTitle] = useState<string>(JOB_TITLE_EXAMPLES[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [nearbyLocations, setNearbyLocations] = useState<string[]>(FALLBACK_LOCATIONS);
  const [locationLoading, setLocationLoading] = useState(false);
  const [lastLocationFetch, setLastLocationFetch] = useState<number>(0);

  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.300', 'gray.500');
  const suggestionHoverBg = useColorModeValue('gray.50', 'gray.600');
  const labelColor = useColorModeValue('gray.800', 'gray.100');
  const inputBg = useColorModeValue('white', 'gray.600');
  const inputTextColor = useColorModeValue('gray.900', 'white');
  const placeholderColor = useColorModeValue('gray.500', 'gray.300');
  const helperTextColor = useColorModeValue('gray.600', 'gray.300');

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

  const getNearbyLocations = async () => {
    // Prevent multiple rapid clicks (cooldown period of 5 seconds)
    const now = Date.now();
    if (locationLoading || (now - lastLocationFetch < 5000)) {
      return;
    }

    setLocationLoading(true);
    setLastLocationFetch(now);
    
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        console.log('Geolocation not supported, using fallback locations');
        setNearbyLocations(FALLBACK_LOCATIONS);
        return;
      }

      // Get user's coordinates
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        });
      });

      const { latitude, longitude } = position.coords;

      // First, get the user's current location details to determine country
      const userLocationResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&` +
        `lat=${latitude}&` +
        `lon=${longitude}&` +
        `addressdetails=1`
      );

      let userCountry = '';
      let userProvince = '';
      let userCity = '';

      if (userLocationResponse.ok) {
        const userLocationData = await userLocationResponse.json();
        userCountry = userLocationData.address?.country || '';
        userProvince = userLocationData.address?.state || userLocationData.address?.province || '';
        userCity = userLocationData.address?.city || userLocationData.address?.town || '';
      }

      // Find nearby cities, prioritizing the user's country
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=city&` +
        `lat=${latitude}&` +
        `lon=${longitude}&` +
        `bounded=1&` +
        `viewbox=${longitude-3},${latitude-3},${longitude+3},${latitude+3}&` + // ~350km box
        `limit=100&` +
        `addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        
        // Filter and prioritize cities from user's country
        const userCountryCities = data
          .filter((item: any) => 
            (item.type === 'city' || item.type === 'town') &&
            item.address?.country === userCountry
          );

        const otherCities = data
          .filter((item: any) => 
            (item.type === 'city' || item.type === 'town') &&
            item.address?.country !== userCountry
          );

        // Combine with priority to user's country
        const allCities = [...userCountryCities, ...otherCities];
        
        // Format locations based on country
        const locations = allCities
          .map((item: any) => {
            const city = item.address?.city || item.address?.town || item.display_name.split(',')[0];
            const region = item.address?.state || item.address?.province || '';
            const country = item.address?.country || '';
            
            // Format based on country conventions
            if (country === 'Canada') {
              // Use proper Canadian province abbreviations
              const provinceAbbr = CANADIAN_PROVINCES[region] || region;
              return region ? `${city}, ${provinceAbbr}` : city;
            } else if (country === 'United States') {
              // Use proper US state abbreviations
              const stateAbbr = US_STATES[region] || region;
              return region ? `${city}, ${stateAbbr}` : city;
            } else if (country === 'United Kingdom') {
              // For UK, use city, region format
              return region ? `${city}, ${region}` : city;
            } else if (country === 'Australia') {
              // Australia uses state abbreviations too
              const auStates: { [key: string]: string } = {
                'New South Wales': 'NSW', 'Victoria': 'VIC', 'Queensland': 'QLD',
                'Western Australia': 'WA', 'South Australia': 'SA', 'Tasmania': 'TAS',
                'Northern Territory': 'NT', 'Australian Capital Territory': 'ACT'
              };
              const stateAbbr = auStates[region] || region;
              return region ? `${city}, ${stateAbbr}` : city;
            } else {
              // For other countries, use city, country format for clarity
              // Unless it's a well-known region, then use city, region
              const knownRegions = ['England', 'Scotland', 'Wales', 'Bavaria', 'Catalonia', 'Tuscany'];
              if (region && knownRegions.includes(region)) {
                return `${city}, ${region}`;
              }
              return country ? `${city}, ${country}` : city;
            }
          })
          .filter((loc: string, index: number, arr: string[]) => arr.indexOf(loc) === index) // Remove duplicates
          .slice(0, 8); // Get more options

        if (locations.length > 0) {
          // Start with Remote and user's current city
          const finalLocations = ['Remote'];
          
          // Add user's current city if we have it
          if (userCity && userProvince) {
            let formattedUserCity = userCity;
            
            if (userCountry === 'Canada') {
              const provinceAbbr = CANADIAN_PROVINCES[userProvince] || userProvince;
              formattedUserCity = `${userCity}, ${provinceAbbr}`;
            } else if (userCountry === 'United States') {
              const stateAbbr = US_STATES[userProvince] || userProvince;
              formattedUserCity = `${userCity}, ${stateAbbr}`;
            } else if (userProvince) {
              formattedUserCity = `${userCity}, ${userProvince}`;
            }
            
            finalLocations.push(formattedUserCity);
          }
          
          // Add other nearby cities, avoiding duplicates
          finalLocations.push(...locations.filter(loc => !finalLocations.some(existing => 
            existing.toLowerCase().includes(loc.split(',')[0].toLowerCase())
          )));
          
          setNearbyLocations(finalLocations.slice(0, 6));
        } else {
          setNearbyLocations(FALLBACK_LOCATIONS);
        }
      } else {
        setNearbyLocations(FALLBACK_LOCATIONS);
      }
    } catch (error) {
      console.log('Geolocation failed, using fallback locations');
      setNearbyLocations(FALLBACK_LOCATIONS);
    } finally {
      setLocationLoading(false);
    }
  };

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
      <VStack spacing={4} w="full" align="stretch">
        {formError && (
          <Alert status="error" borderRadius="md" boxShadow="sm" size="sm">
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
            <HStack justify="space-between" mb={2}>
              <HStack>
                <Text fontSize="sm" fontWeight="semibold" color={labelColor}>Recent Searches</Text>
              </HStack>
              <Button size="xs" variant="ghost" onClick={clearSavedSearches} color={helperTextColor} _hover={{ bg: suggestionHoverBg }}>
                Clear
              </Button>
            </HStack>
            <Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={2}>
              {savedSearches.map((search) => (
                <Button
                  key={search.id}
                  size="xs"
                  variant="outline"
                  leftIcon={<StarIcon w={3} h={3} />}
                  onClick={() => loadSavedSearch(search)}
                  justifyContent="flex-start"
                  px={2}
                  py={3}
                  textAlign="left"
                  bg={inputBg}
                  color={inputTextColor}
                  borderColor={borderColor}
                  _hover={{ bg: suggestionHoverBg, borderColor: 'teal.400' }}
                  transition="all 0.2s"
                  h="auto"
                >
                  <VStack spacing={0} align="start" flex="1">
                    <Text fontSize="xs" fontWeight="medium" noOfLines={1}>
                      {search.title}
                    </Text>
                    {search.location && (
                      <Text fontSize="xs" color={helperTextColor} noOfLines={1}>
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
        <FormControl id="jobTitle">
          <FormLabel color={labelColor} mb={2} fontWeight="semibold" fontSize="sm">
            <HStack>
              <SearchIcon color="teal.500" w={4} h={4} />
              <Text>Job Title</Text>
              <Text fontSize="xs" color="red.500" fontWeight="normal">required</Text>
            </HStack>
          </FormLabel>
          <Box position="relative">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setShowSuggestions(e.target.value.length > 1);
              }}
              onFocus={() => setShowSuggestions(title.length > 1)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={`e.g., ${placeholderTitle}`}
              bg={inputBg}
              color={inputTextColor}
              borderRadius="md"
              borderWidth="1px"
              borderColor={borderColor}
              _placeholder={{ color: placeholderColor }}
              _focus={{ 
                borderColor: 'teal.400', 
                boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.1)',
                bg: inputBg
              }}
              _hover={{ borderColor: 'teal.300' }}
              transition="all 0.2s"
              fontSize="sm"
              fontWeight="normal"
              size="md"
              pr="2.5rem"
            />
            {title && (
              <IconButton
                aria-label="Clear"
                icon={<CloseIcon w={3} h={3} />}
                size="xs"
                variant="ghost"
                color={inputTextColor}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.500') }}
                onClick={() => {
                  setTitle('');
                  setShowSuggestions(false);
                }}
                position="absolute"
                right={2}
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
              />
            )}
          </Box>
          
          {/* Title Suggestions */}
          {showSuggestions && titleSuggestions.length > 0 && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              zIndex={10}
              bg={bg}
              border="1px solid"
              borderColor="teal.300"
              borderRadius="md"
              mt={1}
              boxShadow="lg"
              overflow="hidden"
            >
              {titleSuggestions.map((suggestion, index) => (
                <Box
                  key={index}
                  p={3}
                  cursor="pointer"
                  color={inputTextColor}
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

        {/* Popular Searches */}
        <Box>
          <Text fontSize="xs" color={helperTextColor} mb={2} fontWeight="medium">
            Popular searches
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            {POPULAR_SEARCHES.map((search) => (
              <Button
                key={search}
                size="xs"
                variant="outline"
                onClick={() => {
                  setTitle(search);
                  setShowSuggestions(false);
                }}
                px={3}
                py={1}
                h="auto"
                borderRadius="full"
                fontSize="xs"
                fontWeight="medium"
                bg={inputBg}
                color={inputTextColor}
                borderColor={useColorModeValue('gray.300', 'gray.600')}
                _hover={{ 
                  borderColor: 'teal.400',
                  bg: useColorModeValue('teal.50', 'teal.900'),
                  color: 'teal.600'
                }}
                transition="all 0.2s"
              >
                {search}
              </Button>
            ))}
          </HStack>
        </Box>

        {/* Location Input */}
        <FormControl id="location">
          <FormLabel color={labelColor} mb={2} fontWeight="semibold" fontSize="sm">
            <HStack>
              <LocationIcon color="teal.500" w={4} h={4} />
              <Text>Location</Text>
              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="normal">optional</Text>
            </HStack>
          </FormLabel>
          <Box position="relative">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, CA or Remote"
              bg={inputBg}
              color={inputTextColor}
              borderRadius="md"
              borderWidth="1px"
              borderColor={borderColor}
              _placeholder={{ color: placeholderColor }}
              _focus={{ 
                borderColor: 'teal.400', 
                boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.1)',
                bg: inputBg
              }}
              _hover={{ borderColor: 'teal.300' }}
              transition="border-color 0.1s ease-out"
              fontSize="sm"
              fontWeight="normal"
              size="md"
              pr="2.5rem"
            />
            {location && (
              <IconButton
                aria-label="Clear location"
                icon={<CloseIcon w={3} h={3} />}
                size="xs"
                variant="ghost"
                color={inputTextColor}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.500') }}
                onClick={() => setLocation('')}
                position="absolute"
                right={2}
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
              />
            )}
          </Box>
          <FormHelperText color={helperTextColor} fontSize="xs" fontWeight="normal">
            Leave empty to search all locations
          </FormHelperText>
        </FormControl>

        {/* Popular Locations */}
        <Box>
          <HStack spacing={3} mb={2} align="center">
            <Text fontSize="xs" color={helperTextColor} fontWeight="medium">
              Popular locations
            </Text>
            <Button
              size="xs"
              variant="ghost"
              onClick={getNearbyLocations}
              isLoading={locationLoading}
              loadingText="Finding"
              isDisabled={locationLoading || (Date.now() - lastLocationFetch < 5000)}
              color="teal.600"
              _hover={{ bg: useColorModeValue('teal.50', 'teal.900') }}
              _disabled={{ 
                color: useColorModeValue('gray.400', 'gray.600'),
                cursor: 'not-allowed'
              }}
              fontSize="xs"
              fontWeight="medium"
              px={2}
            >
              📍 Use my location
            </Button>
          </HStack>
          <HStack spacing={2} overflowX="auto" pb={1}>
            {nearbyLocations.slice(0, 4).map((locationOption) => (
              <Button
                key={locationOption}
                size="xs"
                variant="outline"
                onClick={() => setLocation(locationOption)}
                px={3}
                py={1}
                h="auto"
                borderRadius="full"
                fontSize="xs"
                fontWeight="medium"
                bg={inputBg}
                color={inputTextColor}
                borderColor={useColorModeValue('gray.300', 'gray.600')}
                _hover={{ 
                  borderColor: 'teal.400',
                  bg: useColorModeValue('teal.50', 'teal.900'),
                  color: 'teal.600'
                }}
                transition="all 0.2s"
                whiteSpace="nowrap"
                flexShrink={0}
              >
                {locationOption}
              </Button>
            ))}
          </HStack>
        </Box>

        {/* Time Range */}
        <FormControl id="timeRange">
          <FormLabel color={labelColor} mb={2} fontWeight="semibold" fontSize="sm">
            <HStack>
              <Icon viewBox="0 0 24 24" color="teal.500" w={4} h={4}>
                <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              </Icon>
              <Text>Date Posted</Text>
            </HStack>
          </FormLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            bg={inputBg}
            color={inputTextColor}
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
            _focus={{ 
              borderColor: 'teal.400', 
              boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.1)',
              bg: inputBg
            }}
            _hover={{ borderColor: 'teal.300' }}
            transition="all 0.2s"
            fontSize="sm"
            fontWeight="normal"
            size="md"
          >
            {TIME_RANGE_OPTIONS.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                style={{ 
                  backgroundColor: useColorModeValue('#ffffff', '#4A5568'),
                  color: useColorModeValue('#1A202C', '#F7FAFC')
                }}
              >
                {option.label}
              </option>
            ))}
          </Select>
          <FormHelperText color={helperTextColor} fontSize="xs" fontWeight="normal">
            Newer postings generally have more accurate job requirements
          </FormHelperText>
        </FormControl>

        <Button
          type="submit"
          colorScheme="teal"
          isLoading={isLoading}
          loadingText="Analyzing..."
          size="md"
          py={6}
          borderRadius="md"
          isDisabled={isLoading || !title.trim()}
          leftIcon={<SearchIcon w={4} h={4} />}
          _active={{ transform: 'translateY(0)' }}
          transition="all 0.2s"
          fontSize="sm"
          fontWeight="semibold"
          bgGradient="linear(to-r, teal.400, blue.500)"
          _hover={{ 
            bgGradient: "linear(to-r, teal.500, blue.600)",
            transform: 'translateY(-1px)',
            boxShadow: 'md'
          }}
        >
          Analyze Job Market
        </Button>
        
        {!title.trim() && (
          <Alert status="info" borderRadius="md" size="sm" bg={useColorModeValue('blue.50', 'blue.900')} borderColor={useColorModeValue('blue.200', 'blue.600')} py={3}>
            <AlertIcon color="blue.500" />
            <Text fontSize="xs" color={useColorModeValue('blue.700', 'blue.200')}>
              Enter a job title to get started with intelligent market analysis
            </Text>
          </Alert>
        )}
      </VStack>
    </form>
  );
};