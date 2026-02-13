import React from 'react';
import {
    Box, Heading, Text, VStack, HStack, Tag, Icon, Progress,
    useColorModeValue, SimpleGrid, Stat, StatLabel, StatNumber,
    Table, Thead, Tbody, Tr, Th, Td, Badge,
    Spinner, Flex,
} from '@chakra-ui/react';
import { FaChartLine, FaTrophy, FaCalendarAlt } from 'react-icons/fa';
import type { AggregateStats } from '../types';

interface TrendsDashboardProps {
    stats: AggregateStats | null;
    loading: boolean;
}

const TrendsDashboard: React.FC<TrendsDashboardProps> = ({ stats, loading }) => {
    const bg = useColorModeValue('white', 'gray.800');
    const border = useColorModeValue('gray.100', 'gray.700');
    const muted = useColorModeValue('gray.500', 'gray.400');
    const text = useColorModeValue('gray.700', 'gray.200');
    const titleColor = useColorModeValue('gray.600', 'gray.300');
    const sectionBg = useColorModeValue('gray.50', 'gray.750');
    const rowHover = useColorModeValue('gray.50', 'gray.700');
    const barBg = useColorModeValue('gray.100', 'gray.600');
    const accent = useColorModeValue('teal.500', 'teal.300');

    if (loading) {
        return <Flex justify="center" py={6}><Spinner size="sm" color="teal.400" /></Flex>;
    }
    if (!stats) return null;

    const formatDate = (ts: string) => {
        return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const topCert = stats.all_time_certs[0];
    const maxAvg = topCert?.avg_percentage || 1;

    return (
        <Box bg={bg} borderRadius="xl" borderWidth="1px" borderColor={border} overflow="hidden">
            {/* Header */}
            <Box p={4} borderBottomWidth="1px" borderColor={border}>
                <HStack spacing={2}>
                    <Icon as={FaChartLine} color={accent} w={4} h={4} />
                    <Heading size="sm" color={text}>All-Time Stats</Heading>
                    <Badge colorScheme="teal" variant="subtle" fontSize="2xs">
                        {stats.total_scans} scan{stats.total_scans !== 1 ? 's' : ''}
                    </Badge>
                </HStack>
            </Box>

            <Box p={4}>
                <VStack spacing={4} align="stretch">
                    {/* Summary row */}
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                        <Stat size="sm">
                            <StatLabel color={muted} fontSize="2xs" textTransform="uppercase">Total Scans</StatLabel>
                            <StatNumber fontSize="xl">{stats.total_scans}</StatNumber>
                        </Stat>
                        <Stat size="sm">
                            <StatLabel color={muted} fontSize="2xs" textTransform="uppercase">Jobs Analyzed</StatLabel>
                            <StatNumber fontSize="xl">{stats.total_jobs_with_descriptions.toLocaleString()}</StatNumber>
                        </Stat>
                        <Stat size="sm">
                            <StatLabel color={muted} fontSize="2xs" textTransform="uppercase">Certs Tracked</StatLabel>
                            <StatNumber fontSize="xl">{stats.all_time_certs.length}</StatNumber>
                        </Stat>
                        <Stat size="sm">
                            <StatLabel color={muted} fontSize="2xs" textTransform="uppercase">Tracking Since</StatLabel>
                            <StatNumber fontSize="xl">{formatDate(stats.first_scan)}</StatNumber>
                        </Stat>
                    </SimpleGrid>

                    {/* All-time cert rankings */}
                    <Box>
                        <HStack spacing={2} mb={2}>
                            <Icon as={FaTrophy} color="orange.400" w={3.5} h={3.5} />
                            <Heading size="xs" color={titleColor} textTransform="uppercase" letterSpacing="wider">
                                All-Time Cert Rankings
                            </Heading>
                            <Text fontSize="xs" color={muted}>— avg % across all scans</Text>
                        </HStack>

                        <Box bg={sectionBg} p={2} borderRadius="lg">
                            <VStack spacing={1} align="stretch">
                                {stats.all_time_certs.slice(0, 10).map((cert, i) => (
                                    <HStack key={cert.name} spacing={3} p={2} borderRadius="md" _hover={{ bg: rowHover }} transition="all 0.1s">
                                        <Text fontSize="sm" fontWeight="bold" color={muted} w="20px" textAlign="right">{i + 1}</Text>
                                        <Box flex={1}>
                                            <HStack spacing={2} align="baseline">
                                                <Text fontWeight="semibold" fontSize="sm" color={text}>{cert.name}</Text>
                                                {cert.org && <Text fontSize="2xs" color={muted}>{cert.org}</Text>}
                                            </HStack>
                                            <Progress
                                                value={(cert.avg_percentage / maxAvg) * 100}
                                                size="xs" colorScheme="teal" borderRadius="full"
                                                mt={1} bg={barBg}
                                            />
                                        </Box>
                                        <VStack spacing={0} align="end" flexShrink={0}>
                                            <Text fontSize="md" fontWeight="bold" color={accent} lineHeight="1">{cert.avg_percentage}%</Text>
                                            <Text fontSize="2xs" color={muted}>{cert.scans_appeared}/{stats.total_scans} scans</Text>
                                        </VStack>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>
                    </Box>

                    {/* Scan-by-scan trend table */}
                    {stats.trend_data.length > 1 && (
                        <Box>
                            <HStack spacing={2} mb={2}>
                                <Icon as={FaCalendarAlt} color="blue.400" w={3.5} h={3.5} />
                                <Heading size="xs" color={titleColor} textTransform="uppercase" letterSpacing="wider">
                                    Scan-by-Scan Trends
                                </Heading>
                                <Text fontSize="xs" color={muted}>— cert % over time</Text>
                            </HStack>

                            <Box overflowX="auto" bg={sectionBg} borderRadius="lg" p={2}>
                                <Table size="sm" variant="unstyled">
                                    <Thead>
                                        <Tr>
                                            <Th color={muted} fontSize="2xs" px={2} pb={2}>Date</Th>
                                            <Th color={muted} fontSize="2xs" px={2} pb={2}>Search</Th>
                                            <Th color={muted} fontSize="2xs" px={2} pb={2} isNumeric>Jobs</Th>
                                            {stats.top_cert_names.slice(0, 6).map(name => (
                                                <Th key={name} color={muted} fontSize="2xs" px={2} pb={2} isNumeric>{name}</Th>
                                            ))}
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {stats.trend_data.slice().reverse().map((point, i) => (
                                            <Tr key={i} _hover={{ bg: rowHover }}>
                                                <Td px={2} py={1.5} fontSize="xs" color={text} whiteSpace="nowrap">{point.date}</Td>
                                                <Td px={2} py={1.5} fontSize="xs" color={text} maxW="120px" isTruncated>{point.job_title}</Td>
                                                <Td px={2} py={1.5} fontSize="xs" color={text} isNumeric>{point.jobs}</Td>
                                                {stats.top_cert_names.slice(0, 6).map(name => {
                                                    const val = point[name];
                                                    const pct = typeof val === 'number' ? val : 0;
                                                    return (
                                                        <Td key={name} px={2} py={1.5} isNumeric>
                                                            {pct > 0 ? (
                                                                <Tag size="sm" colorScheme={pct >= 20 ? 'teal' : pct >= 10 ? 'blue' : 'gray'}
                                                                    variant={pct >= 20 ? 'solid' : 'subtle'} fontSize="2xs"
                                                                >
                                                                    {pct}%
                                                                </Tag>
                                                            ) : (
                                                                <Text fontSize="2xs" color={muted}>—</Text>
                                                            )}
                                                        </Td>
                                                    );
                                                })}
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    )}
                </VStack>
            </Box>
        </Box>
    );
};

export default TrendsDashboard;
