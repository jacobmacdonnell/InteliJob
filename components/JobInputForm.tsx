import React, { useState, useEffect } from 'react';
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
  Box
} from '@chakra-ui/react';
import type { JobCriteria } from '../types';
import { TIME_RANGE_OPTIONS, JOB_TITLE_EXAMPLES } from '../constants';

interface JobInputFormProps {
  onSubmit: (criteria: JobCriteria) => void;
  isLoading: boolean;
}

export const JobInputForm: React.FC<JobInputFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>(TIME_RANGE_OPTIONS[0].value);
  const [placeholderTitle, setPlaceholderTitle] = useState<string>(JOB_TITLE_EXAMPLES[0]);
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setFormError("Job title is required.");
      return;
    }
    setFormError(null);
    onSubmit({ 
      job_title: title, 
      location: location || undefined, 
      time_range: timeRange 
    });
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={6} w="full" align="stretch">
      {formError && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            {formError}
          </Box>
          <CloseButton onClick={() => setFormError(null)} position="relative" right={-1} top={-1} />
        </Alert>
      )}
      <FormControl isRequired id="jobTitle">
        <FormLabel color="gray.300" mb={1}>
          Job Title <Text as="span" color="red.500">*</Text>
        </FormLabel>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`e.g., ${placeholderTitle}`}
        />
      </FormControl>

      <FormControl id="location">
        <FormLabel color="gray.300" mb={1}>
          Location (Optional)
        </FormLabel>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., San Francisco, CA or Remote"
        />
      </FormControl>

      <FormControl id="timeRange">
        <FormLabel color="gray.300" mb={1}>
          Date Posted (Optional)
        </FormLabel>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          {TIME_RANGE_OPTIONS.map(option => (
            <option 
              key={option.value} 
              value={option.value}
              // Chakra typically handles option styling via system or specific theme overrides.
              // For explicit dark mode option styling if needed:
              style={{ backgroundColor: 'var(--chakra-colors-gray-700)', color: 'var(--chakra-colors-gray-100)'}}
            >
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>

      <Button
        type="submit"
        colorScheme="teal"
        isLoading={isLoading}
        loadingText="Scanning..."
        size="lg"
        py={6} // Custom padding for larger button feel
        isDisabled={isLoading}
      >
        Scan Job Postings
      </Button>
    </VStack>
  );
};