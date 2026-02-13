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

export interface ExtractedItem {
  name: string;
  count: number;
  percentage: number;
  sources?: JobSource[];
  full_name?: string;
  org?: string;
}

export interface ReportSection {
  title: string;
  items: ExtractedItem[];
}

export interface BackendReportSection {
  title: string;
  items: ExtractedItem[];
}

export interface BackendReportData {
  certifications: BackendReportSection;
  skills: BackendReportSection;
  experience: BackendReportSection;
  education: BackendReportSection;
  total_jobs_found: number;
  jobs_with_descriptions: number;
  search_criteria: {
    job_title: string;
    location?: string;
    time_range?: string;
  };
}

export interface ReportData {
  certifications: ReportSection;
  skills: ReportSection;
  experience: ReportSection;
  education: ReportSection;
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

export interface TimeRangeOption {
  value: string;
  label: string;
}
