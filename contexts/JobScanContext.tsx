
import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { fetchReport } from '../services/JobScanService';
import type { JobCriteria, ReportData } from '../types';

interface JobScanContextType {
  reportData: ReportData | null;
  isLoading: boolean;
  error: string | null;
  handleScan: (criteria: JobCriteria) => Promise<void>;
}

const JobScanContext = createContext<JobScanContextType | undefined>(undefined);

export const JobScanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(async (criteria: JobCriteria) => {
    setIsLoading(true);
    setError(null);
    setReportData(null);
    try {
      const data = await fetchReport(criteria);
      setReportData(data);
    } catch (err: any) {
      console.error("Scan failed:", err);
      if (err.isAxiosError && err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.isAxiosError && err.message) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching the report.");
      }
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <JobScanContext.Provider value={{ reportData, isLoading, error, handleScan }}>
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
