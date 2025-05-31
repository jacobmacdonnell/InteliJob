import React from 'react';
import { Box, Heading, Text, VStack, Button, Flex, SimpleGrid, Icon, useColorModeValue, Fade, Container, HStack, Divider } from '@chakra-ui/react';
import { FaCheckCircle, FaShieldAlt, FaDollarSign, FaRocket, FaArrowRight, FaRegLightbulb, FaChartLine, FaBriefcase, FaUserTie, FaGlobe, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Placeholder data for pricing tiers
const pricingTiers = [
  {
    name: 'Starter',
    price: '$5/month',
    features: [
      "100 job analyses per month",
      "AI-powered skills & requirements extraction",
      "Basic resume analysis",
      "CSV export of results",
      "Email support"
    ],
    icon: FaCheckCircle,
    buttonText: 'Choose Starter',
  },
  {
    name: 'Pro',
    price: '$15/month',
    features: [
      "Unlimited job analyses",
      "Advanced skills, certifications, and experience analytics",
      "Real-time market insights & competition analysis",
      "Interactive dashboard (filter, sort, search)",
      "Priority email & chat support"
    ],
    icon: FaShieldAlt,
    buttonText: 'Choose Pro',
  },
  {
    name: 'Elite',
    price: '$30/month',
    features: [
      "All Pro features",
      "Custom AI model tuning",
      "Dedicated account manager",
      "API access & integrations",
      "Early access to new features"
    ],
    icon: FaDollarSign,
    buttonText: 'Choose Elite',
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
  {
    title: 'Global Job Data',
    description: 'Access job market intelligence from around the world, tailored to your location and industry.',
    icon: FaGlobe,
  },
  {
    title: 'Career Growth Tools',
    description: 'Track your progress, set goals, and receive personalized recommendations for your career journey.',
    icon: FaUserTie,
  },
  {
    title: 'Professional Reports',
    description: 'Download beautiful, shareable reports to showcase your skills and market fit.',
    icon: FaBriefcase,
  },
];

const testimonials = [
  {
    name: 'Alex P.',
    title: 'Software Engineer',
    quote: 'InteliJob helped me land my dream job in just 3 weeks. The insights were spot on!',
  },
  {
    name: 'Maria G.',
    title: 'Product Manager',
    quote: 'The resume analysis and market data gave me a real edge over other candidates.',
  },
  {
    name: 'Samir K.',
    title: 'Data Scientist',
    quote: 'I love the clean UI and actionable feedback. Highly recommended for any job seeker!',
  },
];

const LandingPage: React.FC = () => {
  const heroBgGradient = useColorModeValue('linear(to-r, teal.500, blue.500)', 'linear(to-r, teal.600, blue.600)');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.700', 'white');
  const accentColor = useColorModeValue('teal.400', 'teal.300');

  return (
    <Fade in={true} transition={{ enter: { duration: 0.6 } }}>
      <Box minH="100vh" bg={sectionBg}>
        {/* Hero Section */}
        <Box bgGradient={heroBgGradient} color="white" py={{ base: 20, md: 28 }} px={{ base: 4, md: 8 }}>
          <Container maxW="5xl">
            <VStack spacing={8} textAlign="center">
              <HStack justify="center" spacing={3}>
                <Icon as={FaStar} w={10} h={10} color={accentColor} />
                <Heading as="h1" size="2xl" fontWeight="extrabold" textShadow="1px 1px 3px rgba(0,0,0,0.2)">
                  Unlock Your Career Potential with <Box as="span" color={accentColor}>InteliJob</Box>
                </Heading>
              </HStack>
              <Text fontSize="xl" maxW="3xl" color="whiteAlpha.900">
                Navigate the job market with precision. Our AI-driven insights help you find the right opportunities, faster, and stand out from the competition.
              </Text>
              <Button
                as={Link}
                to="/app"
                colorScheme="orange"
                size="lg"
                rightIcon={<FaArrowRight />}
                px={10}
                py={6}
                fontSize="xl"
                fontWeight="bold"
                shadow="lg"
                _hover={{ transform: 'scale(1.05)', bg: 'orange.400' }}
                transition="transform 0.2s, background 0.2s"
                letterSpacing="wide"
              >
                Try the Tool Now
              </Button>
            </VStack>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxW="6xl" py={20}>
          <VStack spacing={4} textAlign="center" mb={12}>
            <Heading as="h2" size="xl" color={headingColor} fontWeight="bold">
              Why InteliJob?
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="2xl">
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
                <Icon as={feature.icon} w={12} h={12} color={accentColor} />
                <Heading as="h3" size="md" color={headingColor}>
                  {feature.title}
                </Heading>
                <Text color={textColor}>{feature.description}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>

        {/* Testimonials Section */}
        <Box bg={useColorModeValue('white', 'gray.700')} py={16}>
          <Container maxW="5xl">
            <VStack spacing={8} textAlign="center">
              <Heading as="h2" size="lg" color={headingColor} fontWeight="bold">
                What Our Users Say
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                {testimonials.map((t, idx) => (
                  <Box key={idx} bg={sectionBg} borderRadius="lg" p={6} boxShadow="md">
                    <Text fontSize="md" color={textColor} mb={4} fontStyle="italic">"{t.quote}"</Text>
                    <Divider my={2} />
                    <Text fontWeight="bold" color={accentColor}>{t.name}</Text>
                    <Text fontSize="sm" color={textColor}>{t.title}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Pricing Section */}
        <Container maxW="6xl" py={20}>
          <VStack spacing={4} textAlign="center" mb={12}>
            <Heading as="h2" size="xl" color={headingColor} fontWeight="bold">
              Find the Perfect Plan
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="2xl">
              Start smart, go pro, or scale big. InteliJob plans are designed for every stage of your career journey.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} justifyItems="center" alignItems="stretch">
            {pricingTiers.map((tier) => {
              const isPro = tier.name === 'Pro';
              const isElite = tier.name === 'Elite';
              return (
                <Flex
                  key={tier.name}
                  direction="column"
                  align="center"
                  justify="flex-start"
                  bg={isPro ? 'teal.500' : cardBg}
                  color={isPro ? 'white' : headingColor}
                  p={10}
                  borderRadius="2xl"
                  boxShadow={isPro ? '2xl' : 'lg'}
                  borderWidth={isPro ? '2px' : '1px'}
                  borderColor={isPro ? 'teal.600' : useColorModeValue('gray.200', 'gray.600')}
                  position="relative"
                  transition="all 0.3s"
                  _hover={{ transform: 'translateY(-8px)', boxShadow: '3xl' }}
                  minW={isPro ? '340px' : '300px'}
                  maxW="sm"
                  width="100%"
                  zIndex={isPro ? 2 : 1}
                >
                  {isPro && (
                    <Box
                      position="absolute"
                      top={-5}
                      left="50%"
                      transform="translateX(-50%)"
                      bg="orange.400"
                      color="white"
                      px={4}
                      py={1}
                      borderRadius="full"
                      fontWeight="bold"
                      fontSize="sm"
                      letterSpacing="wide"
                      shadow="md"
                      zIndex={3}
                    >
                      Most Popular
                    </Box>
                  )}
                  <VStack spacing={4} align="center" textAlign="center" w="100%">
                    <Icon as={tier.icon} w={12} h={12} color={isPro ? 'white' : accentColor} />
                    <Heading as="h3" size="lg" color={isPro ? 'white' : headingColor} fontWeight="bold" textAlign="center" w="100%">
                      {tier.name}
                    </Heading>
                    <Text fontSize="3xl" fontWeight="extrabold" color={isPro ? 'white' : accentColor} textAlign="center" w="100%">
                      {tier.price}
                    </Text>
                    <VStack spacing={3} align="flex-start" w="100%" px={0} textAlign="left">
                      {tier.features.map((feature, idx) => (
                        <HStack key={idx} spacing={3} align="flex-start" w="100%">
                          <Box pt={1} minW={5} display="flex" justifyContent="center">
                            <Icon as={FaCheckCircle} color={isPro ? 'white' : 'teal.400'} w={5} h={5} />
                          </Box>
                          <Text color={isPro ? 'whiteAlpha.900' : textColor} fontSize="md" lineHeight="1.6" w="100%">{feature}</Text>
                        </HStack>
                      ))}
                    </VStack>
                    <Button
                      colorScheme={isPro ? 'orange' : 'teal'}
                      variant={isElite ? 'outline' : 'solid'}
                      size="lg"
                      mt={6}
                      width="100%"
                      fontWeight="bold"
                      fontSize="md"
                      _hover={isPro ? { bg: 'orange.400', color: 'white' } : { opacity: 0.9, transform: 'scale(1.04)' }}
                      transition="all 0.2s"
                      as={isElite ? undefined : Link}
                      to={isElite ? undefined : '/app'}
                      aria-label={isElite ? 'Contact Sales' : `Choose ${tier.name}`}
                    >
                      {tier.buttonText}
                    </Button>
                    {isElite && (
                      <Text color={textColor} fontSize="sm" mt={2} textAlign="left">
                        Custom AI, integrations, and dedicated support. <br />Contact us for a tailored solution.
                      </Text>
                    )}
                  </VStack>
                </Flex>
              );
            })}
          </SimpleGrid>
        </Container>

        {/* Call to Action Section */}
        <Box py={{ base: 16, md: 20 }} px={{ base: 4, md: 8 }} bg={sectionBg} textAlign="center">
          <Heading as="h2" size="xl" color={headingColor} fontWeight="bold" mb={6}>
            Take Control of Your Career Path Today
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="xl" mx="auto" mb={8}>
            Stop waiting for opportunities and start creating them. Join thousands of successful job seekers who trust InteliJob. Sign up now and experience the future of job searching!
          </Text>
          <Button
            as={Link}
            to="/app"
            colorScheme="orange"
            size="lg"
            rightIcon={<FaArrowRight />}
            px={10}
            py={6}
            fontSize="xl"
            fontWeight="bold"
            shadow="lg"
            _hover={{ transform: 'scale(1.05)', bg: 'orange.400' }}
            transition="transform 0.2s, background 0.2s"
            letterSpacing="wide"
          >
            Get Started Now
          </Button>
        </Box>
      </Box>
    </Fade>
  );
};

export default LandingPage;
