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

// This new type defines the structure for sections coming from the backend
export interface BackendReportSection {
  title: string;
  items: ExtractedItem[];
}

export interface BackendReportData {
  certifications: BackendReportSection; // Changed
  skills: BackendReportSection; // Changed from technical_skills
  experience: BackendReportSection; // Changed from experience_requirements
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
