import React from 'react';
import { Box, Heading, Text, VStack, Button, Flex, SimpleGrid, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaCheckCircle, FaShieldAlt, FaDollarSign, FaRocket } from 'react-icons/fa'; // Example icons

// Placeholder data for pricing tiers
const pricingTiers = [
  {
    name: 'Basic',
    price: '$10/month',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    icon: FaCheckCircle,
  },
  {
    name: 'Pro',
    price: '$30/month',
    features: ['All Basic features', 'Feature 4', 'Feature 5'],
    icon: FaShieldAlt,
  },
  {
    name: 'Enterprise',
    price: 'Contact Us',
    features: ['All Pro features', 'Custom solutions', 'Dedicated support'],
    icon: FaDollarSign,
  },
];

// Placeholder data for features
const features = [
  {
    title: 'Amazing Feature 1',
    description: 'Description for amazing feature 1 that will wow your customers.',
    icon: FaRocket,
  },
  {
    title: 'Reliable Feature 2',
    description: 'Description for reliable feature 2, ensuring peace of mind.',
    icon: FaShieldAlt,
  },
  {
    title: 'Affordable Feature 3',
    description: 'Description for affordable feature 3, providing great value.',
    icon: FaDollarSign,
  },
];

// Define props for LandingPage to accept the navigation function
interface LandingPageProps {
  onNavigateToApp: () => void;
}
export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToApp }) => {
  const heroBgGradient = useColorModeValue('linear(to-r, teal.500, blue.500)', 'linear(to-r, teal.600, blue.600)');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.700', 'white');

  return (
    <Box>
      {/* Hero Section */}
      <Flex
        align="center"
        justify="center"
        direction="column"
        py={{ base: 20, md: 28 }}
        px={{ base: 4, md: 8 }}
        bgGradient={heroBgGradient}
        color="white"
        textAlign="center"
      >
        <Heading as="h1" size="2xl" fontWeight="extrabold" mb={4} textShadow="1px 1px 3px rgba(0,0,0,0.2)">
          Welcome to InteliJob - Your Smart Career Assistant
        </Heading>
        <Text fontSize="xl" mb={8} maxW="2xl">
          Discover the perfect job opportunities and gain a competitive edge with our AI-powered job market intelligence.
        </Text>
        <Button
          colorScheme="orange"
          size="lg"
          onClick={onNavigateToApp}
          _hover={{ transform: 'scale(1.05)' }}
          transition="transform 0.2s ease-in-out"
        >
          Get Started Now
        </Button>
      </Flex>

      {/* Features Section */}
      <Box py={{ base: 16, md: 20 }} px={{ base: 4, md: 8 }} bg={sectionBg}>
        <VStack spacing={4} textAlign="center" mb={12}>
          <Heading as="h2" size="xl" color={headingColor}>
            Why Choose InteliJob?
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="xl">
            We provide cutting-edge tools to help you navigate the job market effectively.
          </Text>
        </VStack>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          {features.map((feature, index) => (
            <VStack
              key={index}
              bg={cardBg}
              p={8}
              borderRadius="lg"
              boxShadow="lg"
              spacing={4}
              align="center"
              textAlign="center"
              transition="all 0.3s ease-in-out"
              _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl' }}
            >
              <Icon as={feature.icon} w={12} h={12} color="teal.400" />
              <Heading as="h3" size="md" color={headingColor}>
                {feature.title}
              </Heading>
              <Text color={textColor}>{feature.description}</Text>
            </VStack>
          ))}
        </SimpleGrid>
      </Box>

      {/* Pricing Section */}
      <Box py={{ base: 16, md: 20 }} px={{ base: 4, md: 8 }}>
        <VStack spacing={4} textAlign="center" mb={12}>
          <Heading as="h2" size="xl" color={headingColor}>
            Flexible Pricing Plans
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="xl">
            Choose the plan that best fits your needs and budget.
          </Text>
        </VStack>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} justifyItems="center">
          {pricingTiers.map((tier, index) => (
            <VStack
              key={tier.name}
              bg={cardBg}
              p={8}
              borderRadius="lg"
              boxShadow={tier.name === 'Pro' ? '2xl' : 'lg'}
              spacing={5}
              align="stretch"
              textAlign="center"
              borderWidth="1px"
              borderColor={useColorModeValue('gray.200', 'gray.600')}
              borderTopWidth={tier.name === 'Pro' ? "4px" : "1px"}
              borderTopColor={tier.name === 'Pro' ? "blue.400" : useColorModeValue('gray.200', 'gray.600')}
              maxW="sm"
              width="100%"
              transition="all 0.3s ease-in-out"
              _hover={{ transform: 'translateY(-5px)', boxShadow: tier.name === 'Pro' ? '2xl' : 'xl' }}
            >
              <Icon as={tier.icon} w={10} h={10} color="blue.400" />
              <Heading as="h3" size="lg" color={headingColor}>
                {tier.name}
              </Heading>
              <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                {tier.price}
              </Text>
              <VStack spacing={2} align="stretch">
                {tier.features.map((feature, index) => (
                  <Text key={index} color={textColor}>- {feature}</Text>
                ))}
              </VStack>
              <Button
                colorScheme="teal"
                variant="solid" mt={6}
                width="100%"
                _hover={{ opacity: 0.9, transform: 'scale(1.05)' }}
                transition="opacity 0.2s ease-in-out, transform 0.2s ease-in-out">
                Choose Plan
              </Button>
            </VStack>
          ))}
        </SimpleGrid>
      </Box>

      {/* Call to Action Section */}
      <Box py={{ base: 16, md: 20 }} px={{ base: 4, md: 8 }} bg={sectionBg} textAlign="center">
        <Heading as="h2" size="xl" color={headingColor} mb={6}>
          Ready to Supercharge Your Job Search?
        </Heading>
        <Text fontSize="lg" color={textColor} maxW="xl" mx="auto" mb={8}>
          Join InteliJob today and take the next step in your career journey.
        </Text>
        <Button
          colorScheme="orange"
          size="lg"
          onClick={onNavigateToApp}
          _hover={{ transform: 'scale(1.05)' }}
          transition="transform 0.2s ease-in-out"
        >
          Sign Up for Free
        </Button>
      </Box>
    </Box>
  );
};
