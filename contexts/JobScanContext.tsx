import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { fetchReport } from '../services/JobScanService';
import type { JobCriteria, ReportData } from '../types';

interface JobScanContextType {
  reportData: ReportData | null;
  savedResults: ReportData[];
  isLoading: boolean;
  error: string | null;
  handleScan: (criteria: JobCriteria) => Promise<void>;
  clearSaved: () => void;
}

const JobScanContext = createContext<JobScanContextType | undefined>(undefined);

export const JobScanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [savedResults, setSavedResults] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(async (criteria: JobCriteria) => {
    setIsLoading(true);
    setError(null);

    // Save current result for comparison before replacing it
    if (reportData) {
      setSavedResults(prev => {
        const updated = [reportData, ...prev];
        return updated.slice(0, 3); // Keep max 3 saved results
      });
    }

    setReportData(null);
    try {
      const data = await fetchReport(criteria);
      setReportData(data);
    } catch (err: any) {
      console.error("Scan failed:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching the report.");
      }
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  }, [reportData]);

  const clearSaved = useCallback(() => {
    setSavedResults([]);
  }, []);

  return (
    <JobScanContext.Provider value={{ reportData, savedResults, isLoading, error, handleScan, clearSaved }}>
      {children}
    </JobScanContext.Provider>
  );
};

export const useJobScan = (): JobScanContextType => {
  const context = useContext(JobScanContext);
  if (context === undefined) {
    throw new Error('useJobScan must be used within a JobScanProvider');
  }
  return context;
};
