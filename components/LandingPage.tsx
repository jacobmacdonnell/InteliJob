import React from 'react';
import { Box, Heading, Text, VStack, Button, Flex, SimpleGrid, Icon, useColorModeValue, Fade } from '@chakra-ui/react'; // Import Fade
import { FaCheckCircle, FaShieldAlt, FaDollarSign, FaRocket, FaArrowRight, FaRegLightbulb, FaChartLine } from 'react-icons/fa'; // Added FaRegLightbulb, FaChartLine

// Placeholder data for pricing tiers
const pricingTiers = [
  {
    name: 'Starter', // Renamed
    price: '$10/month',
    features: [
      "AI Job Matching (100 searches/mo)",
      "Basic Resume Analysis",
      "Email Support"
    ],
    icon: FaCheckCircle, // Stays the same
    buttonText: 'Choose Starter', // New button text
  },
  {
    name: 'Pro',
    price: '$30/month',
    features: [
      "Unlimited AI Job Matching",
      "In-Depth Resume Analysis & Keywords",
      "Real-Time Market Insights",
      "Priority Email & Chat Support"
    ],
    icon: FaShieldAlt, // Stays the same
    buttonText: 'Choose Pro', // New button text
  },
  {
    name: 'Enterprise',
    price: 'Contact Us',
    features: [
      "All Pro Features",
      "Custom AI Model Tuning",
      "Dedicated Account Manager",
      "API Access & Integrations"
    ],
    icon: FaDollarSign, // Stays the same
    buttonText: 'Contact Sales', // New button text
  },
];

// Placeholder data for features
const features = [
  {
    title: 'AI-Powered Job Matching',
    description: 'Stop scrolling endlessly. Our intelligent algorithms match your unique skills and aspirations to the perfect job openings, saving you time and effort.',
    icon: FaRocket,
  },
  {
    title: 'In-Depth Resume Analysis',
    description: 'Get actionable feedback on your resume. We identify areas for improvement and highlight keywords to ensure your application stands out to recruiters.',
    icon: FaRegLightbulb,
  },
  {
    title: 'Real-Time Market Insights',
    description: 'Understand industry trends, salary benchmarks, and in-demand skills. Make informed career decisions backed by current market data.',
    icon: FaChartLine,
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

  return ( // Wrap content in Fade
    <Fade in={true} transition={{ enter: { duration: 0.6 } }}>
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
        <Heading as="h1" size="2xl" fontWeight="extrabold" mb={6} textShadow="1px 1px 3px rgba(0,0,0,0.2)"> {/* Increased mb slightly */}
          Unlock Your Career Potential with InteliJob
        </Heading>
        <Text fontSize="xl" mb={10} maxW="3xl"> {/* Increased mb and maxW slightly */}
          Navigate the job market with precision. Our AI-driven insights help you find the right opportunities, faster, and stand out from the competition.
        </Text>
        <Button
          colorScheme="orange"
          size="lg"
          onClick={onNavigateToApp}
          _hover={{ transform: 'scale(1.05)' }}
          transition="transform 0.2s ease-in-out"
          rightIcon={<FaArrowRight />}
          letterSpacing="wide"
        >
          Discover Your Next Opportunity
        </Button>
      </Flex>

      {/* Features Section */}
      <Box py={{ base: 16, md: 20 }} px={{ base: 4, md: 8 }} bg={sectionBg}>
        <VStack spacing={4} textAlign="center" mb={12}>
          <Heading as="h2" size="xl" color={headingColor} fontWeight="bold"> {/* Ensure bold, though default for heading */}
            Gain a Competitive Edge
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="xl">
            InteliJob equips you with intelligent tools and actionable insights for a smarter, faster job search.
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
          <Heading as="h2" size="xl" color={headingColor} fontWeight="bold">
            Find the Perfect Plan
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="xl">
            Start smart, go pro, or scale big. InteliJob plans are designed for every stage of your career journey.
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
              spacing={6} // Slightly increased spacing
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
              <VStack spacing={3} align="start" w="100%" px={2}> {/* Align features to start, add padding */}
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
                {tier.buttonText}
              </Button>
            </VStack>
          ))}
        </SimpleGrid>
      </Box>

      {/* Call to Action Section */}
      <Box py={{ base: 16, md: 20 }} px={{ base: 4, md: 8 }} bg={sectionBg} textAlign="center">
        <Heading as="h2" size="xl" color={headingColor} fontWeight="bold" mb={6}>
          Take Control of Your Career Path Today
        </Heading>
        <Text fontSize="lg" color={textColor} maxW="xl" mx="auto" mb={8}>
          Stop waiting for opportunities and start creating them. Join thousands of successful job seekers who trust InteliJob. Sign up now and experience the future of job searching!
        </Text>
        <Button
          colorScheme="orange"
          size="lg"
          onClick={onNavigateToApp}
          _hover={{ transform: 'scale(1.05)' }}
          transition="transform 0.2s ease-in-out"
          rightIcon={<FaArrowRight />}
          letterSpacing="wide"
        >
          Sign Up & Get Started
        </Button>
      </Box>
    </Box>
    </Fade>
  );
};
