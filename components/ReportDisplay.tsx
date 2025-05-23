import React, { useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Icon,
  Button,
  Flex,
  Tooltip,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  Collapse,
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  DownloadIcon, 
  ViewIcon, 
  TriangleUpIcon,
  TriangleDownIcon,
  InfoIcon,
  SettingsIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons';
import type { ReportData, ReportSection, ExtractedItem } from '../types';
import { AnalyticsInsights } from './AnalyticsInsights';

interface ReportDisplayProps {
  data: ReportData | null;
}

interface FilterOptions {
  searchTerm: string;
  sortBy: 'count' | 'percentage' | 'name';
  sortOrder: 'asc' | 'desc';
  minCount: number;
  minPercentage: number;
  showTopOnly: boolean;
}

const TrendIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 12l3-3 3 3 5-5" />
  </Icon>
);

const ChartIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M8 17V9M12 17v-6M16 17v-3M20 17v-4" />
  </Icon>
);

const AnalyticsIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8M21 7h-4v4" />
  </Icon>
);

const JobSourcesDisplay: React.FC<{ item: ExtractedItem }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sourceBg = useColorModeValue('gray.50', 'gray.700');
  const sourceTextColor = useColorModeValue('gray.700', 'gray.200');
  const companyColor = useColorModeValue('blue.600', 'blue.300');
  const buttonTextColor = useColorModeValue('blue.600', 'blue.300');
  
  if (!item.sources || item.sources.length === 0) {
    return null;
  }

  return (
    <Box mt={2}>
      <Button
        size="xs"
        variant="ghost"
        leftIcon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        onClick={() => setIsExpanded(!isExpanded)}
        color={buttonTextColor}
        fontWeight="normal"
        px={0}
        py={1}
        h="auto"
        fontSize="xs"
        _hover={{ color: useColorModeValue('blue.700', 'blue.200') }}
      >
        {item.sources.length} source{item.sources.length > 1 ? 's' : ''}
      </Button>
      
      <Collapse in={isExpanded} animateOpacity>
        <Box mt={2} bg={sourceBg} borderRadius="sm" p={2}>
          <VStack spacing={1} align="stretch">
            {item.sources.map((source, index) => {
              const jobTitle = source.job.replace(` at ${source.company}`, '');
              const jobUrl = source.job_url || null;
              
              return (
                <HStack
                  key={index}
                  spacing={2}
                  py={1}
                  cursor={jobUrl ? 'pointer' : 'default'}
                  onClick={jobUrl ? () => window.open(jobUrl, '_blank') : undefined}
                  _hover={jobUrl ? { color: companyColor } : {}}
                >
                  <Box w={2} h={2} borderRadius="full" bg="blue.400" flexShrink={0} />
                  <Text fontSize="xs" color={companyColor} fontWeight="medium" minW="80px">
                    {source.company}
                  </Text>
                  <Text fontSize="xs" color={sourceTextColor} flex={1} noOfLines={1}>
                    {jobTitle}
                  </Text>
                  {jobUrl && (
                    <ExternalLinkIcon w={3} h={3} color="blue.400" />
                  )}
                </HStack>
              );
            })}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

const SectionCard: React.FC<{ 
  section: ReportSection; 
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}> = ({ section, filters, onFiltersChange }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBg = useColorModeValue('gray.50', 'gray.800');
  const itemBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const titleColor = useColorModeValue('teal.600', 'teal.300');
  const borderColor = useColorModeValue('teal.200', 'teal.600');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  const filteredItems = useMemo(() => {
    if (!section?.items) return [];
    
    let filtered = section.items.filter(item => {
      // Search filter
      if (filters.searchTerm && !item.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Count filter
      if (item.count < filters.minCount) return false;
      
      // Percentage filter
      if (item.percentage < filters.minPercentage) return false;
      
      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'count':
          comparison = a.count - b.count;
          break;
        case 'percentage':
          comparison = a.percentage - b.percentage;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Limit to top items if enabled
    if (filters.showTopOnly) {
      filtered = filtered.slice(0, 10);
    }

    return filtered;
  }, [section?.items, filters]);

  const exportData = () => {
    const csvContent = [
      ['Skill/Certification', 'Count', 'Percentage'],
      ...filteredItems.map(item => [item.name, item.count.toString(), `${item.percentage}%`])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${section.title.replace(/\s+/g, '_').toLowerCase()}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!section || section.items.length === 0) {
    return (
      <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="lg" textAlign="center">
        <Icon as={InfoIcon} w={10} h={10} color={useColorModeValue('gray.400', 'gray.500')} mb={3} />
        <Heading as="h3" size="md" color={titleColor} mb={2}>
          {section?.title || 'No Data Available'}
        </Heading>
        <Text color={mutedColor} fontSize="sm">No specific data found for this section.</Text>
      </Box>
    );
  }

  return (
    <Box bg={cardBg} borderRadius="lg" boxShadow="lg" overflow="hidden">
      {/* Header */}
      <Box p={4} borderBottomWidth="1px" borderColor={borderColor} bg={useColorModeValue('white', 'gray.750')}>
        <Flex justify="space-between" align="center" mb={3}>
          <HStack spacing={2}>
            <ChartIcon w={5} h={5} color={titleColor} />
            <Heading as="h3" size="md" color={titleColor}>
              {section.title}
            </Heading>
            <Badge colorScheme="teal" variant="subtle" size="sm">
              {filteredItems.length} items
            </Badge>
          </HStack>
          
          <HStack spacing={1}>
            <Tooltip label="Filter & Sort">
              <IconButton
                aria-label="Filter"
                icon={<SettingsIcon />}
                size="xs"
                variant="ghost"
                onClick={onOpen}
              />
            </Tooltip>
            <Tooltip label="Export Data">
              <IconButton
                aria-label="Export"
                icon={<DownloadIcon />}
                size="xs"
                variant="ghost"
                onClick={exportData}
              />
            </Tooltip>
          </HStack>
        </Flex>

        {/* Quick Search */}
        <InputGroup size="sm">
          <InputLeftElement>
            <SearchIcon color={useColorModeValue('gray.400', 'gray.500')} />
          </InputLeftElement>
          <Input
            placeholder={`Search ${section.title.toLowerCase()}...`}
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
            bg={useColorModeValue('gray.50', 'gray.600')}
            border="none"
            fontSize="sm"
          />
        </InputGroup>
      </Box>

      {/* Content */}
      <Box p={4}>
        {filteredItems.length === 0 ? (
          <Text color={mutedColor} textAlign="center" py={6} fontSize="sm">
            No items match your current filters.
          </Text>
        ) : (
          <VStack spacing={1} align="stretch">
            {filteredItems.map((item, index) => (
              <Box
                key={index}
                p={3}
                bg={itemBg}
                borderRadius="sm"
                _hover={{ bg: hoverBg }}
                transition="all 0.2s"
                borderLeftWidth="3px"
                borderLeftColor={`teal.${Math.min(400 + index * 50, 600)}`}
              >
                <HStack justify="space-between" align="center">
                  <HStack spacing={3} flex={1}>
                    <Text 
                      fontWeight="medium" 
                      color={textColor} 
                      fontSize="sm"
                      flex={1}
                    >
                      {item.name}
                    </Text>
                    <HStack spacing={2}>
                      <Badge 
                        colorScheme="teal" 
                        variant="solid"
                        size="sm"
                        px={2}
                      >
                        {item.count}
                      </Badge>
                      <Text fontSize="xs" color={mutedColor} fontWeight="medium" minW="35px">
                        {item.percentage}%
                      </Text>
                    </HStack>
                  </HStack>
                  <Box w="60px">
                    <Progress 
                      value={item.percentage} 
                      size="sm" 
                      colorScheme="teal"
                      borderRadius="sm"
                      bg={useColorModeValue('gray.100', 'gray.600')}
                    />
                  </Box>
                </HStack>
                
                <JobSourcesDisplay item={item} />
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      {/* Advanced Filters Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Filter & Sort Options</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Sort by</FormLabel>
                <HStack>
                  <Select
                    value={filters.sortBy}
                    onChange={(e) => onFiltersChange({ 
                      ...filters, 
                      sortBy: e.target.value as FilterOptions['sortBy']
                    })}
                  >
                    <option value="count">Count</option>
                    <option value="percentage">Percentage</option>
                    <option value="name">Name</option>
                  </Select>
                  <IconButton
                    aria-label="Sort order"
                    icon={filters.sortOrder === 'asc' ? <TriangleUpIcon /> : <TriangleDownIcon />}
                    onClick={() => onFiltersChange({ 
                      ...filters, 
                      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
                    })}
                  />
                </HStack>
              </FormControl>

              <Divider />

              <FormControl>
                <FormLabel>Minimum Count</FormLabel>
                <Input
                  type="number"
                  value={filters.minCount}
                  onChange={(e) => onFiltersChange({ 
                    ...filters, 
                    minCount: parseInt(e.target.value) || 0
                  })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Minimum Percentage</FormLabel>
                <Input
                  type="number"
                  value={filters.minPercentage}
                  onChange={(e) => onFiltersChange({ 
                    ...filters, 
                    minPercentage: parseFloat(e.target.value) || 0
                  })}
                />
              </FormControl>

              <FormControl>
                <HStack justify="space-between">
                  <FormLabel mb="0">Show top 10 only</FormLabel>
                  <Switch
                    isChecked={filters.showTopOnly}
                    onChange={(e) => onFiltersChange({ 
                      ...filters, 
                      showTopOnly: e.target.checked
                    })}
                  />
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export const ReportDisplay: React.FC<ReportDisplayProps> = ({ data }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    sortBy: 'count',
    sortOrder: 'desc',
    minCount: 1,
    minPercentage: 0,
    showTopOnly: false,
  });

  const summaryBg = useColorModeValue('white', 'gray.800');
  const statBg = useColorModeValue('gray.50', 'gray.700');

  if (!data) {
    return null;
  }

  const analysisRate = data.metadata.jobs_with_descriptions > 0 
    ? Math.round((data.metadata.jobs_with_descriptions / data.metadata.total_jobs_found) * 100)
    : 0;

  return (
    <VStack spacing={5} align="stretch">
      {/* Enhanced Analysis Summary */}
      <Box bg={summaryBg} p={4} borderRadius="lg" boxShadow="md" borderLeft="3px solid" borderColor="teal.500">
        <HStack spacing={3} mb={3}>
          <TrendIcon w={5} h={5} color="teal.500" />
          <Heading as="h2" size="md" color="teal.500">
            Analysis Summary
          </Heading>
        </HStack>

        <HStack spacing={4} wrap="wrap">
          <HStack bg={statBg} p={3} borderRadius="md" minW="120px">
            <VStack spacing={0} align="start">
              <Text fontSize="xs" color="gray.500">Jobs Found</Text>
              <Text fontSize="lg" fontWeight="bold" color="teal.500">{data.metadata.total_jobs_found}</Text>
            </VStack>
          </HStack>

          <HStack bg={statBg} p={3} borderRadius="md" minW="120px">
            <VStack spacing={0} align="start">
              <Text fontSize="xs" color="gray.500">Analyzed</Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.500">{data.metadata.jobs_with_descriptions}</Text>
            </VStack>
          </HStack>

          <HStack bg={statBg} p={3} borderRadius="md" minW="120px">
            <VStack spacing={0} align="start">
              <Text fontSize="xs" color="gray.500">Quality</Text>
              <Text fontSize="lg" fontWeight="bold" color="green.500">{analysisRate}%</Text>
            </VStack>
          </HStack>

          <HStack bg={statBg} p={3} borderRadius="md" minW="120px">
            <VStack spacing={0} align="start">
              <Text fontSize="xs" color="gray.500">Query</Text>
              <Text fontSize="sm" fontWeight="bold" color="purple.500" noOfLines={1}>
                {data.metadata.search_criteria.job_title}
              </Text>
            </VStack>
          </HStack>
        </HStack>
      </Box>

      {/* Tabbed Content */}
      <Tabs variant="enclosed" colorScheme="teal" size="sm">
        <TabList>
          <Tab fontSize="sm">
            <HStack spacing={2}>
              <ChartIcon w={3} h={3} />
              <Text>Skills ({data.skills.items.length})</Text>
            </HStack>
          </Tab>
          <Tab fontSize="sm">
            <HStack spacing={2}>
              <ViewIcon w={3} h={3} />
              <Text>Certifications ({data.certifications.items.length})</Text>
            </HStack>
          </Tab>
          <Tab fontSize="sm">
            <HStack spacing={2}>
              <TrendIcon w={3} h={3} />
              <Text>Experience ({data.experience.items.length})</Text>
            </HStack>
          </Tab>
          <Tab fontSize="sm">
            <HStack spacing={2}>
              <AnalyticsIcon w={3} h={3} />
              <Text>Analytics & Insights</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0} py={4}>
            <SectionCard 
              section={data.skills} 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </TabPanel>
          <TabPanel px={0} py={4}>
            <SectionCard 
              section={data.certifications} 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </TabPanel>
          <TabPanel px={0} py={4}>
            <SectionCard 
              section={data.experience} 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </TabPanel>
          <TabPanel px={0} py={4}>
            <AnalyticsInsights data={data} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};