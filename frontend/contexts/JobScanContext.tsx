import React, { createContext, useState, useCallback, useContext, useEffect, ReactNode } from 'react';
import { fetchReport, fetchHistory, fetchStats } from '../services/JobScanService';
import type { JobCriteria, ReportData, ScanHistoryEntry, AggregateStats } from '../types';

interface JobScanContextType {
  reportData: ReportData | null;
  isLoading: boolean;
  error: string | null;
  history: ScanHistoryEntry[];
  historyLoading: boolean;
  stats: AggregateStats | null;
  statsLoading: boolean;
  lastCriteria: JobCriteria | null;
  handleScan: (criteria: JobCriteria) => Promise<void>;
  loadHistory: () => Promise<void>;
  loadStats: () => Promise<void>;
}

const JobScanContext = createContext<JobScanContextType | undefined>(undefined);

export const JobScanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [lastCriteria, setLastCriteria] = useState<JobCriteria | null>(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch {
      console.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await fetchStats();
      setStats(data);
    } catch {
      console.error('Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const handleScan = useCallback(async (criteria: JobCriteria) => {
    setIsLoading(true);
    setError(null);
    setReportData(null);
    setLastCriteria(criteria);
    try {
      const data = await fetchReport(criteria);
      setReportData(data);
      loadHistory();
      loadStats();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadHistory, loadStats]);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, [loadHistory, loadStats]);

  return (
    <JobScanContext.Provider value={{
      reportData, isLoading, error,
      history, historyLoading,
      stats, statsLoading,
      lastCriteria,
      handleScan, loadHistory, loadStats,
    }}>
      {children}
    </JobScanContext.Provider>
  );
};

export const useJobScan = (): JobScanContextType => {
  const context = useContext(JobScanContext);
  if (!context) throw new Error('useJobScan must be used within a JobScanProvider');
  return context;
};
