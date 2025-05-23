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
}

export interface ReportSection {
  title: string;
  items: ExtractedItem[];
}

export interface BackendReportData {
  certifications: ExtractedItem[];
  technical_skills: ExtractedItem[];
  experience_requirements: ExtractedItem[];
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
