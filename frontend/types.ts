export interface JobCriteria {
  job_title: string;
  location?: string;
  time_range?: string;
  target_path?: string;
  owned_certs?: string[];
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

export interface TitleDistEntry {
  title: string;
  count: number;
  percentage: number;
}

export interface CertPair {
  certs: [string, string];
  count: number;
  percentage: number;
}

export interface ReportData {
  certifications: {
    title: string;
    items: CertItem[];
  };
  metadata: {
    total_jobs_found: number;
    jobs_with_descriptions: number;
    queries_used: string[];
    search_criteria: {
      job_title: string;
      location?: string;
      time_range?: string;
    };
  };
  title_distribution: TitleDistEntry[];
  cert_pairs: CertPair[];
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

export interface AllTimeCert {
  name: string;
  full_name: string;
  org: string;
  total_mentions: number;
  scans_appeared: number;
  avg_percentage: number;
  latest_percentage: number;
}

export interface TrendDataPoint {
  date: string;
  job_title: string;
  jobs: number;
  [certName: string]: string | number;
}

export interface AggregateStats {
  total_scans: number;
  total_jobs_scanned: number;
  total_jobs_with_descriptions: number;
  first_scan: string;
  latest_scan: string;
  all_time_certs: AllTimeCert[];
  trend_data: TrendDataPoint[];
  top_cert_names: string[];
}

export interface TimeRangeOption {
  value: string;
  label: string;
}
