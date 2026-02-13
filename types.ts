export interface JobCriteria {
  job_title: string;
  location?: string;
  time_range?: string;
}

export interface JobSource {
  job: string;
  company: string;
  job_url?: string;
}

export interface CertItem {
  name: string;
  full_name?: string;
  org?: string;
  count: number;
  percentage: number;
  sources?: JobSource[];
}

export interface ReportData {
  certifications: {
    title: string;
    items: CertItem[];
  };
  metadata: {
    total_jobs_found: number;
    jobs_with_descriptions: number;
    search_criteria: {
      job_title: string;
      location?: string;
      time_range?: string;
    };
  };
}

export interface ScanHistoryEntry {
  id: number;
  timestamp: string;
  job_title: string;
  location?: string;
  time_range?: string;
  total_jobs: number;
  jobs_with_descriptions: number;
  cert_data: CertItem[];
}

export interface TimeRangeOption {
  value: string;
  label: string;
}
