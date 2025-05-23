import React, { useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  List,
  ListItem,
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
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  DownloadIcon, 
  ViewIcon, 
  TriangleUpIcon,
  TriangleDownIcon,
  InfoIcon,
  SettingsIcon
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
      <Box bg={cardBg} p={8} borderRadius="xl" boxShadow="lg" textAlign="center">
        <Icon as={InfoIcon} w={12} h={12} color="gray.400" mb={4} />
        <Heading as="h3" size="lg" color={titleColor} mb={3}>
          {section?.title || 'No Data Available'}
        </Heading>
        <Text color={mutedColor}>No specific data found for this section.</Text>
      </Box>
    );
  }

  return (
    <Box bg={cardBg} borderRadius="xl" boxShadow="xl" overflow="hidden">
      {/* Header */}
      <Box p={6} borderBottomWidth="1px" borderColor={borderColor} bg={useColorModeValue('white', 'gray.750')}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={3}>
            <ChartIcon w={6} h={6} color={titleColor} />
            <Heading as="h3" size="lg" color={titleColor}>
              {section.title}
            </Heading>
            <Badge colorScheme="teal" variant="subtle">
              {filteredItems.length} items
            </Badge>
          </HStack>
          
          <HStack spacing={2}>
            <Tooltip label="Filter & Sort">
              <IconButton
                aria-label="Filter"
                icon={<SettingsIcon />}
                size="sm"
                variant="ghost"
                onClick={onOpen}
              />
            </Tooltip>
            <Tooltip label="Export Data">
              <IconButton
                aria-label="Export"
                icon={<DownloadIcon />}
                size="sm"
                variant="ghost"
                onClick={exportData}
              />
            </Tooltip>
          </HStack>
        </Flex>

        {/* Quick Search */}
        <InputGroup size="sm">
          <InputLeftElement>
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder={`Search ${section.title.toLowerCase()}...`}
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
            bg={useColorModeValue('gray.50', 'gray.600')}
            border="none"
          />
        </InputGroup>
      </Box>

      {/* Content */}
      <Box p={6}>
        {filteredItems.length === 0 ? (
          <Text color={mutedColor} textAlign="center" py={8}>
            No items match your current filters.
          </Text>
        ) : (
          <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
            {filteredItems.map((item, index) => (
              <GridItem key={index}>
                <Box
                  bg={itemBg}
                  p={4}
                  borderRadius="lg"
                  boxShadow="sm"
                  _hover={{ bg: hoverBg, transform: 'translateY(-2px)', boxShadow: 'md' }}
                  transition="all 0.2s"
                  borderLeft="4px solid"
                  borderColor={`teal.${Math.min(500 + index * 50, 800)}`}
                >
                  <Flex justify="space-between" align="flex-start" mb={3}>
                    <Text 
                      fontWeight="semibold" 
                      color={textColor} 
                      flex="1"
                      fontSize="sm"
                      lineHeight="tall"
                    >
                      {item.name}
                    </Text>
                    <VStack spacing={1} align="end" minW="80px">
                      <Badge 
                        colorScheme="teal" 
                        variant="solid"
                        size="sm"
                        borderRadius="full"
                      >
                        {item.count}
                      </Badge>
                      <Text fontSize="xs" color={mutedColor} fontWeight="medium">
                        {item.percentage}%
                      </Text>
                    </VStack>
                  </Flex>
                  
                  <Progress 
                    value={item.percentage} 
                    size="sm" 
                    colorScheme="teal"
                    borderRadius="full"
                    bg={useColorModeValue('gray.100', 'gray.600')}
                  />
                </Box>
              </GridItem>
            ))}
          </Grid>
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
    <VStack spacing={8} align="stretch">
      {/* Enhanced Analysis Summary */}
      <Box bg={summaryBg} p={6} borderRadius="xl" boxShadow="lg" borderLeft="4px solid" borderColor="teal.500">
        <HStack spacing={4} mb={4}>
          <TrendIcon w={6} h={6} color="teal.500" />
          <Heading as="h2" size="lg" color="teal.500">
            Analysis Summary
          </Heading>
        </HStack>

        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
          <Stat bg={statBg} p={4} borderRadius="lg">
            <StatLabel>Jobs Found</StatLabel>
            <StatNumber color="teal.500">{data.metadata.total_jobs_found}</StatNumber>
            <StatHelpText>Total postings discovered</StatHelpText>
          </Stat>

          <Stat bg={statBg} p={4} borderRadius="lg">
            <StatLabel>Jobs Analyzed</StatLabel>
            <StatNumber color="blue.500">{data.metadata.jobs_with_descriptions}</StatNumber>
            <StatHelpText>With detailed descriptions</StatHelpText>
          </Stat>

          <Stat bg={statBg} p={4} borderRadius="lg">
            <StatLabel>Analysis Rate</StatLabel>
            <StatNumber color="green.500">{analysisRate}%</StatNumber>
            <StatHelpText>Data quality score</StatHelpText>
          </Stat>

          <Stat bg={statBg} p={4} borderRadius="lg">
            <StatLabel>Search Query</StatLabel>
            <StatNumber fontSize="md" color="purple.500">
              {data.metadata.search_criteria.job_title}
            </StatNumber>
            <StatHelpText>
              {data.metadata.search_criteria.location || 'All locations'}
            </StatHelpText>
          </Stat>
        </Grid>
      </Box>

      {/* Tabbed Content */}
      <Tabs variant="enclosed" colorScheme="teal">
        <TabList>
          <Tab>
            <HStack>
              <ChartIcon w={4} h={4} />
              <Text>Skills ({data.skills.items.length})</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <ViewIcon w={4} h={4} />
              <Text>Certifications ({data.certifications.items.length})</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <TrendIcon w={4} h={4} />
              <Text>Experience ({data.experience.items.length})</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <AnalyticsIcon w={4} h={4} />
              <Text>Analytics & Insights</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <SectionCard 
              section={data.skills} 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </TabPanel>
          <TabPanel px={0}>
            <SectionCard 
              section={data.certifications} 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </TabPanel>
          <TabPanel px={0}>
            <SectionCard 
              section={data.experience} 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </TabPanel>
          <TabPanel px={0}>
            <AnalyticsInsights data={data} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};