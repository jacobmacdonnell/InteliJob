import React, { createContext, useState, useCallback, useContext, useEffect, ReactNode } from 'react';
import { fetchReport, fetchHistory } from '../services/JobScanService';
import type { JobCriteria, ReportData, ScanHistoryEntry } from '../types';

interface JobScanContextType {
  reportData: ReportData | null;
  isLoading: boolean;
  error: string | null;
  history: ScanHistoryEntry[];
  historyLoading: boolean;
  handleScan: (criteria: JobCriteria) => Promise<void>;
  loadHistory: () => Promise<void>;
}

const JobScanContext = createContext<JobScanContextType | undefined>(undefined);

export const JobScanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  const handleScan = useCallback(async (criteria: JobCriteria) => {
    setIsLoading(true);
    setError(null);
    setReportData(null);
    try {
      const data = await fetchReport(criteria);
      setReportData(data);
      // Refresh history after new scan
      loadHistory();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadHistory]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <JobScanContext.Provider value={{ reportData, isLoading, error, history, historyLoading, handleScan, loadHistory }}>
      {children}
    </JobScanContext.Provider>
  );
};

export const useJobScan = (): JobScanContextType => {
  const context = useContext(JobScanContext);
  if (!context) throw new Error('useJobScan must be used within a JobScanProvider');
  return context;
};
