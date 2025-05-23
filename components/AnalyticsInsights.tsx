import React, { useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Progress,
  Icon,
  useColorModeValue,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import { 
  CheckCircleIcon, 
  WarningIcon,
  InfoIcon,
  StarIcon 
} from '@chakra-ui/icons';
import type { ReportData } from '../types';

interface AnalyticsInsightsProps {
  data: ReportData;
}

const TrendingUpIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8M21 7h-4v4" />
  </Icon>
);

const InsightIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Icon>
);

const CompetitionIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Icon>
);

interface Insight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  value?: string;
  recommendation?: string;
}

export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ data }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const statBg = useColorModeValue('gray.50', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.700', 'gray.200');

  const analytics = useMemo(() => {
    const skills = data.skills.items;
    const certs = data.certifications.items;
    const experience = data.experience.items;

    // Calculate competition levels
    const getCompetitionLevel = (percentage: number) => {
      if (percentage >= 70) return 'Very High';
      if (percentage >= 50) return 'High';
      if (percentage >= 30) return 'Medium';
      if (percentage >= 15) return 'Low';
      return 'Very Low';
    };

    // Most in-demand skills (top 3)
    const topSkills = skills.slice(0, 3);
    
    // Niche opportunities (skills with lower competition but decent demand)
    const nicheSkills = skills.filter(skill => 
      skill.percentage >= 10 && skill.percentage <= 30
    ).slice(0, 3);

    // Essential certifications
    const essentialCerts = certs.filter(cert => cert.percentage >= 15);

    // Experience level analysis
    const experienceLevels = experience.map(exp => {
      const text = exp.name.toLowerCase();
      if (text.includes('entry') || text.includes('0') || text.includes('junior')) {
        return { ...exp, level: 'entry' };
      } else if (text.includes('senior') || text.includes('5+') || text.includes('7+')) {
        return { ...exp, level: 'senior' };
      } else {
        return { ...exp, level: 'mid' };
      }
    });

    const entryLevel = experienceLevels.filter(e => e.level === 'entry').reduce((sum, e) => sum + e.percentage, 0);
    const midLevel = experienceLevels.filter(e => e.level === 'mid').reduce((sum, e) => sum + e.percentage, 0);
    const seniorLevel = experienceLevels.filter(e => e.level === 'senior').reduce((sum, e) => sum + e.percentage, 0);

    return {
      topSkills,
      nicheSkills,
      essentialCerts,
      experienceLevels: { entry: entryLevel, mid: midLevel, senior: seniorLevel },
      totalJobsAnalyzed: data.metadata.jobs_with_descriptions,
      analysisQuality: data.metadata.jobs_with_descriptions / data.metadata.total_jobs_found,
      getCompetitionLevel
    };
  }, [data]);

  const insights: Insight[] = useMemo(() => {
    const insights: Insight[] = [];

    // Analysis quality insight
    if (analytics.analysisQuality < 0.5) {
      insights.push({
        type: 'warning',
        title: 'Limited Data Quality',
        description: `Only ${Math.round(analytics.analysisQuality * 100)}% of job postings had detailed descriptions.`,
        recommendation: 'Try adjusting your search criteria or location for better data quality.'
      });
    }

    // Skills insights
    if (analytics.topSkills.length > 0) {
      const topSkill = analytics.topSkills[0];
      insights.push({
        type: 'success',
        title: 'Most In-Demand Skill',
        description: `${topSkill.name} appears in ${topSkill.percentage}% of job postings.`,
        value: `${topSkill.count} jobs`,
        recommendation: topSkill.percentage > 60 ? 'Essential skill - high priority for learning' : 'Important skill to develop'
      });
    }

    // Niche opportunities
    if (analytics.nicheSkills.length > 0) {
      const nicheSkill = analytics.nicheSkills[0];
      insights.push({
        type: 'info',
        title: 'Niche Opportunity',
        description: `${nicheSkill.name} has moderate demand (${nicheSkill.percentage}%) with potentially less competition.`,
        recommendation: 'Consider specializing in this area for competitive advantage.'
      });
    }

    // Certification insights
    if (analytics.essentialCerts.length === 0) {
      insights.push({
        type: 'warning',
        title: 'Few Certification Requirements',
        description: 'Most positions don\'t explicitly require certifications.',
        recommendation: 'Focus on practical skills and portfolio development.'
      });
    } else {
      const topCert = analytics.essentialCerts[0];
      insights.push({
        type: 'success',
        title: 'Key Certification',
        description: `${topCert.name} is required in ${topCert.percentage}% of positions.`,
        recommendation: 'Consider pursuing this certification to boost your competitiveness.'
      });
    }

    // Experience level insights
    if (analytics.experienceLevels.entry > 30) {
      insights.push({
        type: 'success',
        title: 'Entry-Level Friendly',
        description: `${Math.round(analytics.experienceLevels.entry)}% of positions are suitable for entry-level candidates.`,
        recommendation: 'Good opportunities for career starters.'
      });
    } else if (analytics.experienceLevels.senior > 50) {
      insights.push({
        type: 'info',
        title: 'Senior-Level Market',
        description: `${Math.round(analytics.experienceLevels.senior)}% of positions require senior-level experience.`,
        recommendation: 'Consider building more experience or targeting junior positions.'
      });
    }

    return insights;
  }, [analytics]);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success': return CheckCircleIcon;
      case 'warning': return WarningIcon;
      case 'info': return InfoIcon;
      case 'error': return WarningIcon;
      default: return InfoIcon;
    }
  };

  const getInsightColorScheme = (type: Insight['type']) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'orange';
      case 'info': return 'blue';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Market Overview */}
      <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
        <HStack spacing={3} mb={3}>
          <TrendingUpIcon w={5} h={5} color="teal.500" />
          <Heading as="h3" size="md" color="teal.500">
            Market Analytics
          </Heading>
        </HStack>

        <Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={3}>
          <Stat bg={statBg} p={3} borderRadius="md">
            <StatLabel fontSize="sm">Market Size</StatLabel>
            <StatNumber color="blue.500" fontSize="lg">{data.metadata.total_jobs_found}</StatNumber>
            <StatHelpText fontSize="xs">Total opportunities found</StatHelpText>
          </Stat>

          <Stat bg={statBg} p={3} borderRadius="md">
            <StatLabel fontSize="sm">Data Quality</StatLabel>
            <StatNumber color="green.500" fontSize="lg">
              {Math.round(analytics.analysisQuality * 100)}%
            </StatNumber>
            <StatHelpText fontSize="xs">Job descriptions analyzed</StatHelpText>
          </Stat>

          <Stat bg={statBg} p={3} borderRadius="md">
            <StatLabel fontSize="sm">Skill Diversity</StatLabel>
            <StatNumber color="purple.500" fontSize="lg">{data.skills.items.length}</StatNumber>
            <StatHelpText fontSize="xs">Unique skills identified</StatHelpText>
          </Stat>

          <Stat bg={statBg} p={3} borderRadius="md">
            <StatLabel fontSize="sm">Cert Requirements</StatLabel>
            <StatNumber color="orange.500" fontSize="lg">{analytics.essentialCerts.length}</StatNumber>
            <StatHelpText fontSize="xs">Essential certifications</StatHelpText>
          </Stat>
        </Grid>
      </Box>

      {/* Experience Level Distribution */}
      <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
        <HStack spacing={3} mb={3}>
          <CompetitionIcon w={5} h={5} color="blue.500" />
          <Heading as="h3" size="md" color="blue.500">
            Experience Level Distribution
          </Heading>
        </HStack>

        <Grid templateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={4}>
          <VStack>
            <CircularProgress 
              value={analytics.experienceLevels.entry} 
              color="green.400" 
              size="80px"
              thickness="10px"
            >
              <CircularProgressLabel fontSize="xs" fontWeight="bold">
                {Math.round(analytics.experienceLevels.entry)}%
              </CircularProgressLabel>
            </CircularProgress>
            <Text fontWeight="semibold" color="green.500" fontSize="sm">Entry Level</Text>
            <Text fontSize="xs" color={mutedTextColor} textAlign="center">
              0-2 years experience
            </Text>
          </VStack>

          <VStack>
            <CircularProgress 
              value={analytics.experienceLevels.mid} 
              color="blue.400" 
              size="80px"
              thickness="10px"
            >
              <CircularProgressLabel fontSize="xs" fontWeight="bold">
                {Math.round(analytics.experienceLevels.mid)}%
              </CircularProgressLabel>
            </CircularProgress>
            <Text fontWeight="semibold" color="blue.500" fontSize="sm">Mid Level</Text>
            <Text fontSize="xs" color={mutedTextColor} textAlign="center">
              3-5 years experience
            </Text>
          </VStack>

          <VStack>
            <CircularProgress 
              value={analytics.experienceLevels.senior} 
              color="purple.400" 
              size="80px"
              thickness="10px"
            >
              <CircularProgressLabel fontSize="xs" fontWeight="bold">
                {Math.round(analytics.experienceLevels.senior)}%
              </CircularProgressLabel>
            </CircularProgress>
            <Text fontWeight="semibold" color="purple.500" fontSize="sm">Senior Level</Text>
            <Text fontSize="xs" color={mutedTextColor} textAlign="center">
              5+ years experience
            </Text>
          </VStack>
        </Grid>
      </Box>

      {/* Competition Analysis */}
      {analytics.topSkills.length > 0 && (
        <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
          <HStack spacing={3} mb={3}>
            <StarIcon w={5} h={5} color="yellow.500" />
            <Heading as="h3" size="md" color="yellow.600">
              Top Skills Competition
            </Heading>
          </HStack>

          <VStack spacing={1} align="stretch">
            {analytics.topSkills.slice(0, 8).map((skill, index) => {
              const competition = analytics.getCompetitionLevel(skill.percentage);
              const competitionColor = 
                competition === 'Very High' ? 'red' :
                competition === 'High' ? 'orange' :
                competition === 'Medium' ? 'yellow' :
                competition === 'Low' ? 'blue' : 'green';
              
              return (
                <HStack key={index} py={2} px={3} bg={statBg} borderRadius="sm" justify="space-between">
                  <HStack spacing={3} flex={1}>
                    <Text fontWeight="medium" fontSize="sm" flex={1}>
                      {skill.name}
                    </Text>
                    <Badge colorScheme={competitionColor} variant="solid" size="sm">
                      {competition}
                    </Badge>
                    <Text fontSize="xs" color={mutedTextColor} minW="40px" textAlign="right">
                      {skill.percentage}%
                    </Text>
                  </HStack>
                  <Box w="60px">
                    <Progress 
                      value={skill.percentage} 
                      colorScheme={competitionColor}
                      size="sm"
                      borderRadius="sm"
                    />
                  </Box>
                </HStack>
              );
            })}
          </VStack>
        </Box>
      )}

      {/* Insights & Recommendations */}
      <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
        <HStack spacing={3} mb={3}>
          <InsightIcon w={5} h={5} color="teal.500" />
          <Heading as="h3" size="md" color="teal.500">
            Key Insights
          </Heading>
        </HStack>

        <VStack spacing={2} align="stretch">
          {insights.map((insight, index) => (
            <HStack 
              key={index} 
              p={3}
              bg={useColorModeValue(
                insight.type === 'success' ? 'green.50' : 
                insight.type === 'warning' ? 'orange.50' : 
                insight.type === 'info' ? 'blue.50' : 'red.50',
                insight.type === 'success' ? 'green.900' : 
                insight.type === 'warning' ? 'orange.900' : 
                insight.type === 'info' ? 'blue.900' : 'red.900'
              )}
              borderRadius="sm" 
              align="start"
              spacing={3}
            >
              <Icon 
                as={getInsightIcon(insight.type)} 
                w={4} 
                h={4} 
                color={`${getInsightColorScheme(insight.type)}.500`}
                mt={0.5}
                flexShrink={0}
              />
              <VStack align="start" spacing={1} flex={1}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="semibold" fontSize="sm" color={textColor}>
                    {insight.title}
                  </Text>
                  {insight.value && (
                    <Badge colorScheme={getInsightColorScheme(insight.type)} variant="subtle" size="sm">
                      {insight.value}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color={mutedTextColor} lineHeight="1.4">
                  {insight.description}
                </Text>
                {insight.recommendation && (
                  <Text fontSize="xs" color={textColor} fontStyle="italic" mt={1}>
                    💡 {insight.recommendation}
                  </Text>
                )}
              </VStack>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* Niche Opportunities */}
      {analytics.nicheSkills.length > 0 && (
        <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
          <HStack spacing={3} mb={3}>
            <TrendingUpIcon w={5} h={5} color="green.500" />
            <Heading as="h3" size="md" color="green.500">
              Niche Opportunities
            </Heading>
          </HStack>

          <Text mb={3} color={textColor} fontSize="xs">
            Skills with moderate demand but potentially lower competition:
          </Text>

          <VStack spacing={1} align="stretch">
            {analytics.nicheSkills.map((skill, index) => (
              <HStack key={index} py={2} px={3} bg={statBg} borderRadius="sm" justify="space-between">
                <HStack spacing={2} flex={1}>
                  <CheckCircleIcon color="green.400" w={3} h={3} />
                  <Text fontSize="sm" flex={1}>{skill.name}</Text>
                </HStack>
                <HStack spacing={2}>
                  <Badge colorScheme="green" variant="subtle" size="sm">
                    {skill.percentage}%
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {skill.count}
                  </Badge>
                </HStack>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}; 