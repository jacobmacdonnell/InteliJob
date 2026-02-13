import React, { useState, useMemo } from 'react';
import {
    Box, Container, VStack, HStack, Heading, Text, Select, Icon,
    Progress, SimpleGrid, Stat, StatLabel, StatNumber,
    useColorModeValue, Badge, Tag, Flex,
} from '@chakra-ui/react';
import { FaShieldAlt, FaTrophy, FaLightbulb, FaBriefcase } from 'react-icons/fa';
import { useJobScan } from '../contexts/JobScanContext';
import type { CertItem, ScanHistoryEntry } from '../types';

// ── Helpers ─────────────────────────────────────────────────────────────────

interface RoleStats {
    scans: number;
    totalJobs: number;
    certs: CertItem[];
    topPair: { certs: [string, string]; percentage: number } | null;
    coverageInsight: string;
}

function aggregateByRole(entries: ScanHistoryEntry[]): RoleStats {
    if (entries.length === 0) {
        return { scans: 0, totalJobs: 0, certs: [], topPair: null, coverageInsight: '' };
    }

    const certAccum: Record<string, { count: number; full_name: string; org: string; pcts: number[] }> = {};
    let totalJobs = 0;

    // Track cert co-occurrence per scan
    const pairCounter: Record<string, number> = {};

    for (const entry of entries) {
        const jobs = entry.jobs_with_descriptions || entry.total_jobs;
        totalJobs += jobs;

        const scanCertNames: string[] = [];
        for (const cert of entry.cert_data) {
            if (!certAccum[cert.name]) {
                certAccum[cert.name] = { count: 0, full_name: cert.full_name || cert.name, org: cert.org || '', pcts: [] };
            }
            certAccum[cert.name].count += cert.count;
            certAccum[cert.name].pcts.push(cert.percentage);
            scanCertNames.push(cert.name);
        }

        // Count pairs
        const unique = [...new Set(scanCertNames)].sort();
        for (let i = 0; i < unique.length; i++) {
            for (let j = i + 1; j < unique.length; j++) {
                const key = `${unique[i]}||${unique[j]}`;
                pairCounter[key] = (pairCounter[key] || 0) + 1;
            }
        }
    }

    // Build ranked certs (by average percentage)
    const ranked: CertItem[] = Object.entries(certAccum)
        .map(([name, data]) => ({
            name,
            full_name: data.full_name,
            org: data.org,
            count: data.count,
            percentage: Math.round((data.pcts.reduce((a, b) => a + b, 0) / data.pcts.length) * 10) / 10,
        }))
        .sort((a, b) => b.percentage - a.percentage);

    // Top pair
    let topPair: RoleStats['topPair'] = null;
    const pairEntries = Object.entries(pairCounter).sort((a, b) => b[1] - a[1]);
    if (pairEntries.length > 0 && pairEntries[0][1] >= 2) {
        const [key, count] = pairEntries[0];
        const [a, b] = key.split('||');
        topPair = { certs: [a, b], percentage: Math.round((count / entries.length) * 100) };
    }

    // Coverage insight
    let coverageInsight = '';
    if (ranked.length >= 2) {
        const top2 = ranked.slice(0, 2);
        const combined = Math.min(top2[0].percentage + top2[1].percentage * 0.6, 99);
        coverageInsight = `Getting ${top2[0].name} + ${top2[1].name} covers ~${Math.round(combined)}% of these job postings.`;
    } else if (ranked.length === 1) {
        coverageInsight = `${ranked[0].name} appears in ${ranked[0].percentage}% of job postings for this role.`;
    }

    return { scans: entries.length, totalJobs, certs: ranked, topPair, coverageInsight };
}

// ── Components ──────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => {
    const muted = useColorModeValue('gray.500', 'gray.400');
    return (
        <Box textAlign="center" py={12}>
            <Icon as={FaShieldAlt} w={10} h={10} color="gray.300" mb={3} />
            <Heading size="sm" color={muted} mb={1}>No scan data yet</Heading>
            <Text fontSize="sm" color={muted}>Run some scans on the Scan tab to build up your stats.</Text>
        </Box>
    );
};

const CertRankingCard: React.FC<{ certs: CertItem[] }> = ({ certs }) => {
    const bg = useColorModeValue('white', 'gray.750');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const text = useColorModeValue('gray.800', 'gray.100');
    const muted = useColorModeValue('gray.500', 'gray.400');
    const accent = useColorModeValue('teal.600', 'teal.300');
    const barBg = useColorModeValue('gray.100', 'gray.600');
    const maxPct = certs[0]?.percentage || 1;

    return (
        <VStack spacing={1} align="stretch">
            {certs.slice(0, 12).map((cert, i) => {
                const barVal = (cert.percentage / maxPct) * 100;
                const isTop3 = i < 3;

                return (
                    <HStack
                        key={cert.name} spacing={3} p={3} bg={bg} borderRadius="md"
                        _hover={{ bg: hoverBg }} transition="all 0.1s"
                    >
                        {/* Rank */}
                        <Flex
                            w="28px" h="28px" borderRadius="full" align="center" justify="center" flexShrink={0}
                            bg={isTop3 ? 'teal.500' : 'transparent'}
                            color={isTop3 ? 'white' : muted}
                            fontWeight="bold" fontSize="sm"
                        >
                            {i + 1}
                        </Flex>

                        {/* Cert info + bar */}
                        <Box flex={1} minW={0}>
                            <HStack spacing={2} align="baseline" mb={0.5}>
                                <Text fontWeight="bold" fontSize="md" color={text}>{cert.name}</Text>
                                {cert.org && <Text fontSize="xs" color={muted}>{cert.org}</Text>}
                            </HStack>
                            {cert.full_name && cert.full_name !== cert.name && (
                                <Text fontSize="xs" color={muted} mt={-0.5} mb={1}>{cert.full_name}</Text>
                            )}
                            <Progress value={barVal} size="sm" colorScheme={isTop3 ? 'teal' : 'blue'} borderRadius="full" bg={barBg} />
                        </Box>

                        {/* Percentage */}
                        <VStack spacing={0} align="end" flexShrink={0} minW="50px">
                            <Text fontSize="xl" fontWeight="bold" color={isTop3 ? accent : text} lineHeight="1">
                                {cert.percentage}%
                            </Text>
                            <Text fontSize="2xs" color={muted}>avg demand</Text>
                        </VStack>
                    </HStack>
                );
            })}
        </VStack>
    );
};

// ── Main Stats Page ─────────────────────────────────────────────────────────

const StatsPage: React.FC = () => {
    const { history, historyLoading } = useJobScan();
    const [selectedRole, setSelectedRole] = useState<string>('__all__');

    const pageBg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const cardBorder = useColorModeValue('gray.100', 'gray.700');
    const muted = useColorModeValue('gray.500', 'gray.400');
    const text = useColorModeValue('gray.700', 'gray.200');
    const titleColor = useColorModeValue('gray.800', 'white');
    const inputBg = useColorModeValue('white', 'gray.700');
    const selectBorder = useColorModeValue('gray.200', 'gray.600');
    const insightBg = useColorModeValue('teal.50', 'rgba(49, 151, 149, 0.1)');
    const insightBorder = useColorModeValue('teal.200', 'teal.700');
    const insightText = useColorModeValue('teal.800', 'teal.200');
    const pairBg = useColorModeValue('purple.50', 'rgba(128, 90, 213, 0.1)');
    const pairBorder = useColorModeValue('purple.200', 'purple.700');
    const pairText = useColorModeValue('purple.800', 'purple.200');
    const optionBg = useColorModeValue('#ffffff', '#2D3748');
    const optionColor = useColorModeValue('#1A202C', '#F7FAFC');

    // Unique role titles from history
    const roleOptions = useMemo(() => {
        const titles = [...new Set(history.map(h => h.job_title))];
        titles.sort();
        return titles;
    }, [history]);

    // Filter + aggregate
    const filtered = useMemo(() => {
        if (selectedRole === '__all__') return history;
        return history.filter(h => h.job_title === selectedRole);
    }, [history, selectedRole]);

    const roleStats = useMemo(() => aggregateByRole(filtered), [filtered]);

    if (historyLoading) {
        return (
            <Box minH="100vh" bg={pageBg}>
                <Container maxW="3xl" py={8}>
                    <Flex justify="center" py={12}>
                        <Text color={muted}>Loading stats...</Text>
                    </Flex>
                </Container>
            </Box>
        );
    }

    return (
        <Box minH="100vh" bg={pageBg}>
            <Container maxW="3xl" w="full" py={6} px={{ base: 4, sm: 6 }}>
                <VStack spacing={4} align="stretch">

                    {/* Page title + role selector */}
                    <Box bg={cardBg} p={5} borderRadius="xl" borderWidth="1px" borderColor={cardBorder} boxShadow="sm">
                        <VStack spacing={4} align="stretch">
                            <Heading size="md" color={titleColor}>Cert Demand Stats</Heading>

                            <HStack spacing={3}>
                                <Text fontSize="sm" color={muted} flexShrink={0}>Filter by role:</Text>
                                <Select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    bg={inputBg} borderColor={selectBorder} size="md" fontSize="sm" borderRadius="md"
                                    _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }}
                                >
                                    <option value="__all__" style={{ backgroundColor: optionBg, color: optionColor }}>All Roles Combined</option>
                                    {roleOptions.map(title => (
                                        <option key={title} value={title} style={{ backgroundColor: optionBg, color: optionColor }}>
                                            {title}
                                        </option>
                                    ))}
                                </Select>
                            </HStack>
                        </VStack>
                    </Box>

                    {/* No data */}
                    {history.length === 0 && <EmptyState />}

                    {/* Stats content */}
                    {roleStats.scans > 0 && (
                        <>
                            {/* Summary cards */}
                            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                                <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={cardBorder}>
                                    <Stat size="sm">
                                        <StatLabel color={muted} fontSize="xs" textTransform="uppercase">Scans Run</StatLabel>
                                        <StatNumber fontSize="2xl">{roleStats.scans}</StatNumber>
                                    </Stat>
                                </Box>
                                <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={cardBorder}>
                                    <Stat size="sm">
                                        <StatLabel color={muted} fontSize="xs" textTransform="uppercase">Jobs Analyzed</StatLabel>
                                        <StatNumber fontSize="2xl">{roleStats.totalJobs.toLocaleString()}</StatNumber>
                                    </Stat>
                                </Box>
                                <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={cardBorder} display={{ base: 'none', md: 'block' }}>
                                    <Stat size="sm">
                                        <StatLabel color={muted} fontSize="xs" textTransform="uppercase">Certs Tracked</StatLabel>
                                        <StatNumber fontSize="2xl">{roleStats.certs.length}</StatNumber>
                                    </Stat>
                                </Box>
                            </SimpleGrid>

                            {/* Insight card */}
                            {roleStats.coverageInsight && (
                                <Box bg={insightBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={insightBorder}>
                                    <HStack spacing={2} align="start">
                                        <Icon as={FaLightbulb} color="teal.400" w={4} h={4} mt={0.5} flexShrink={0} />
                                        <Box>
                                            <Text fontSize="sm" fontWeight="semibold" color={insightText}>
                                                Recommendation
                                            </Text>
                                            <Text fontSize="sm" color={insightText}>
                                                {roleStats.coverageInsight}
                                            </Text>
                                        </Box>
                                    </HStack>
                                </Box>
                            )}

                            {/* Cert pair insight */}
                            {roleStats.topPair && (
                                <Box bg={pairBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={pairBorder}>
                                    <HStack spacing={2} align="start">
                                        <Icon as={FaBriefcase} color="purple.400" w={4} h={4} mt={0.5} flexShrink={0} />
                                        <Box>
                                            <Text fontSize="sm" fontWeight="semibold" color={pairText}>
                                                Most requested combo
                                            </Text>
                                            <HStack spacing={1.5} mt={1}>
                                                <Tag colorScheme="purple" size="md" fontWeight="bold">{roleStats.topPair.certs[0]}</Tag>
                                                <Text fontSize="sm" color={pairText}>+</Text>
                                                <Tag colorScheme="purple" size="md" fontWeight="bold">{roleStats.topPair.certs[1]}</Tag>
                                                <Text fontSize="sm" color={pairText} ml={1}>
                                                    — requested together in {roleStats.topPair.percentage}% of scans
                                                </Text>
                                            </HStack>
                                        </Box>
                                    </HStack>
                                </Box>
                            )}

                            {/* Cert rankings */}
                            <Box bg={cardBg} p={5} borderRadius="xl" borderWidth="1px" borderColor={cardBorder} boxShadow="sm">
                                <HStack spacing={2} mb={4}>
                                    <Icon as={FaTrophy} color="orange.400" w={4} h={4} />
                                    <Heading size="sm" color={text}>
                                        {selectedRole === '__all__' ? 'All-Time' : selectedRole} Cert Rankings
                                    </Heading>
                                    <Badge colorScheme="gray" fontSize="2xs" variant="subtle">
                                        avg across {roleStats.scans} scan{roleStats.scans !== 1 ? 's' : ''}
                                    </Badge>
                                </HStack>

                                {roleStats.certs.length > 0 ? (
                                    <CertRankingCard certs={roleStats.certs} />
                                ) : (
                                    <Text fontSize="sm" color={muted} textAlign="center" py={6}>No cert data for this filter.</Text>
                                )}
                            </Box>
                        </>
                    )}
                </VStack>
            </Container>
        </Box>
    );
};

export default StatsPage;
