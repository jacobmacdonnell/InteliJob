import React from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    Box, VStack, HStack, Text, Icon, Progress, Tag, SimpleGrid,
    Stat, StatLabel, StatNumber, useColorModeValue, Flex,
} from '@chakra-ui/react';
import { FaCertificate } from 'react-icons/fa';
import type { ScanHistoryEntry, CertItem } from '../types';

// Human-readable time range labels
const TIME_RANGE_LABELS: Record<string, string> = {
    'today': 'Today',
    '3days': 'Past 3 Days',
    'week': 'Past Week',
    'month': 'Past Month',
    'all': 'All Time',
};

interface ScanDetailModalProps {
    scan: ScanHistoryEntry | null;
    isOpen: boolean;
    onClose: () => void;
}

const CertRow: React.FC<{ cert: CertItem; rank: number; maxPct: number }> = ({ cert, rank, maxPct }) => {
    const bg = useColorModeValue('white', 'gray.750');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const text = useColorModeValue('gray.800', 'gray.100');
    const muted = useColorModeValue('gray.500', 'gray.400');
    const accent = useColorModeValue('teal.600', 'teal.300');
    const barBg = useColorModeValue('gray.100', 'gray.600');
    const isTop3 = rank <= 3;
    const barVal = maxPct > 0 ? (cert.percentage / maxPct) * 100 : 0;

    return (
        <HStack spacing={3} p={2.5} bg={bg} borderRadius="md" _hover={{ bg: hoverBg }} transition="all 0.1s">
            <Flex
                w="26px" h="26px" borderRadius="full" align="center" justify="center" flexShrink={0}
                bg={isTop3 ? 'teal.500' : 'transparent'}
                color={isTop3 ? 'white' : muted}
                fontWeight="bold" fontSize="xs"
            >
                {rank}
            </Flex>
            <Box flex={1} minW={0}>
                <HStack spacing={2} align="baseline">
                    <Text fontWeight="bold" fontSize="sm" color={text}>{cert.name}</Text>
                    {cert.org && <Text fontSize="2xs" color={muted}>{cert.org}</Text>}
                </HStack>
                {cert.full_name && cert.full_name !== cert.name && (
                    <Text fontSize="2xs" color={muted} mt={-0.5}>{cert.full_name}</Text>
                )}
                <Progress value={barVal} size="xs" colorScheme={isTop3 ? 'teal' : 'blue'} borderRadius="full" mt={1} bg={barBg} />
            </Box>
            <VStack spacing={0} align="end" flexShrink={0}>
                <Text fontSize="md" fontWeight="bold" color={isTop3 ? accent : text} lineHeight="1">{cert.percentage}%</Text>
                <Text fontSize="2xs" color={muted}>{cert.count} jobs</Text>
            </VStack>
        </HStack>
    );
};

const ScanDetailModal: React.FC<ScanDetailModalProps> = ({ scan, isOpen, onClose }) => {
    const headerBg = useColorModeValue('gray.50', 'gray.800');
    const bodyBg = useColorModeValue('white', 'gray.850');
    const muted = useColorModeValue('gray.500', 'gray.400');
    const text = useColorModeValue('gray.700', 'gray.200');
    const sectionBg = useColorModeValue('gray.50', 'gray.800');
    const accent = useColorModeValue('teal.500', 'teal.300');
    const border = useColorModeValue('gray.100', 'gray.700');

    if (!scan) return null;

    const sorted = [...scan.cert_data].sort((a, b) => b.percentage - a.percentage);
    const maxPct = sorted[0]?.percentage || 1;
    const jobs = scan.jobs_with_descriptions || scan.total_jobs;
    const timeRangeLabel = TIME_RANGE_LABELS[scan.time_range || ''] || scan.time_range || 'Unknown';

    const formatDate = (ts: string) => {
        return new Date(ts).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent borderRadius="xl" overflow="hidden" mx={4}>
                <ModalHeader bg={headerBg} borderBottomWidth="1px" borderColor={border} py={4} pr={12}>
                    <VStack align="start" spacing={0.5}>
                        <Text fontSize="lg" fontWeight="bold" color={text}>{scan.job_title}</Text>
                        <HStack spacing={2} flexWrap="wrap">
                            <Text fontSize="xs" color={muted}>{formatDate(scan.timestamp)}</Text>
                            {scan.location && (
                                <>
                                    <Text fontSize="xs" color={muted}>·</Text>
                                    <Text fontSize="xs" color={muted}>{scan.location}</Text>
                                </>
                            )}
                            <Text fontSize="xs" color={muted}>·</Text>
                            <Tag size="sm" variant="subtle" colorScheme="gray" fontSize="2xs">{timeRangeLabel}</Tag>
                        </HStack>
                    </VStack>
                </ModalHeader>
                <ModalCloseButton top={4} />

                <ModalBody bg={bodyBg} p={4} pb={5}>
                    <VStack spacing={4} align="stretch">
                        {/* Stats */}
                        <SimpleGrid columns={3} spacing={3}>
                            <Box bg={sectionBg} p={3} borderRadius="md" borderWidth="1px" borderColor={border}>
                                <Stat size="sm">
                                    <StatLabel color={muted} fontSize="2xs" textTransform="uppercase">Jobs</StatLabel>
                                    <StatNumber fontSize="xl">{jobs}</StatNumber>
                                </Stat>
                            </Box>
                            <Box bg={sectionBg} p={3} borderRadius="md" borderWidth="1px" borderColor={border}>
                                <Stat size="sm">
                                    <StatLabel color={muted} fontSize="2xs" textTransform="uppercase">Certs Found</StatLabel>
                                    <StatNumber fontSize="xl">{sorted.length}</StatNumber>
                                </Stat>
                            </Box>
                            <Box bg={sectionBg} p={3} borderRadius="md" borderWidth="1px" borderColor={border}>
                                <Stat size="sm">
                                    <StatLabel color={muted} fontSize="2xs" textTransform="uppercase">Top Cert</StatLabel>
                                    <StatNumber fontSize="xl" color={accent}>{sorted[0]?.name || '—'}</StatNumber>
                                </Stat>
                            </Box>
                        </SimpleGrid>

                        {/* Cert Rankings */}
                        <Box>
                            <HStack spacing={2} mb={2}>
                                <Icon as={FaCertificate} color={accent} w={3.5} h={3.5} />
                                <Text fontSize="sm" fontWeight="semibold" color={text}>Certification Rankings</Text>
                            </HStack>

                            {sorted.length > 0 ? (
                                <Box bg={sectionBg} p={2} borderRadius="lg">
                                    <VStack spacing={1} align="stretch">
                                        {sorted.map((cert, i) => (
                                            <CertRow key={cert.name} cert={cert} rank={i + 1} maxPct={maxPct} />
                                        ))}
                                    </VStack>
                                </Box>
                            ) : (
                                <Box bg={sectionBg} p={6} borderRadius="lg" textAlign="center">
                                    <Text fontSize="sm" color={muted}>No certifications found in this scan.</Text>
                                </Box>
                            )}
                        </Box>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ScanDetailModal;
