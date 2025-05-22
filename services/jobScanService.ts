import axios from 'axios';
import type { JobCriteria, ReportData, BackendReportData } from '../types';

// Backend API configuration
const API_BASE_URL = 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transform backend data to frontend format
const transformBackendData = (backendData: BackendReportData): ReportData => {
  return {
    skills: {
      title: "Top Technical Skills",
      items: backendData.technical_skills || [],
    },
    certifications: {
      title: "Most Valued Certifications",
      items: backendData.certifications || [],
    },
    experience: {
      title: "Experience Requirements",
      items: backendData.experience_requirements || [],
    },
    metadata: {
      total_jobs_found: backendData.total_jobs_found,
      jobs_with_descriptions: backendData.jobs_with_descriptions,
      search_criteria: backendData.search_criteria,
    },
  };
};

export const fetchReport = async (criteria: JobCriteria): Promise<ReportData> => {
  try {
    console.log("Fetching job analysis from backend API:", criteria);
    
    const response = await apiClient.post('/analyze-jobs', {
      job_title: criteria.job_title,
      location: criteria.location || null,
      time_range: criteria.time_range || '1d',
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Job analysis failed');
    }

    if (!response.data.data) {
      throw new Error('No data received from the analysis');
    }

    return transformBackendData(response.data.data);

  } catch (error: any) {
    console.error("Job analysis failed:", error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorMessage = error.response.data?.detail || error.response.data?.message || error.message;
        
        if (status === 408) {
          throw new Error("Request timeout - the analysis is taking too long. Please try again.");
        } else if (status === 500) {
          throw new Error("Server error occurred during analysis. Please try again later.");
        } else if (status === 400) {
          throw new Error(`Invalid request: ${errorMessage}`);
        } else {
          throw new Error(`Analysis failed (${status}): ${errorMessage}`);
        }
      } else if (error.request) {
        // Network error
        throw new Error("Unable to connect to the analysis service. Please check your connection and ensure the backend is running.");
      }
    }
    
    // Generic error fallback
    throw new Error(error.message || "An unexpected error occurred during job analysis.");
  }
};

// Health check function for the backend
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health');
    return response.data.status === 'healthy';
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};