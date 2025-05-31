import axios from 'axios';
import type { JobCriteria, ReportData, BackendReportData, ExtractedItem } from '../types';

// Backend API configuration
// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Data quality filters
const filterQualityData = (items: ExtractedItem[]): ExtractedItem[] => {
  if (!items || items.length === 0) return [];

  return items.filter(item => {
    // Skip items with very low occurrence (noise)
    if (item.count < 2 && item.percentage < 5) return false;
    
    // Skip empty or very short names
    if (!item.name || item.name.trim().length < 2) return false;
    
    // Skip items that are too generic or nonsensical
    const lowercaseName = item.name.toLowerCase().trim();
    const nonsensicalPatterns = [
      /^[a-z]{1,2}$/i, // Single or double letters
      /^\d+$/, // Only numbers
      /^[^a-zA-Z0-9\s]+$/, // Only special characters
      /^(and|or|the|a|an|in|on|at|to|for|of|with|by|from)$/i, // Common stop words
      /^(work|job|role|position|candidate|team|company|business)$/i, // Too generic job terms
      /^(good|great|excellent|strong|solid|basic|advanced|senior|junior)$/i, // Generic qualifiers
      /^(ability|knowledge|understanding|experience|skills)$/i, // Generic skill words
      /^(preferred|required|must|should|nice|plus|bonus)$/i, // Requirement words
      /^(years?|months?|days?|hours?)$/i, // Time units without context
    ];
    
    if (nonsensicalPatterns.some(pattern => pattern.test(lowercaseName))) {
      return false;
    }
    
    // Skip items that are too long (likely extraction errors)
    if (item.name.length > 100) return false;
    
    return true;
  }).slice(0, 15); // Limit to top 15 items for better UX
};

// Enhanced skill filtering
const filterSkills = (items: ExtractedItem[]): ExtractedItem[] => {
  const filtered = filterQualityData(items);
  
  return filtered.filter(item => {
    const name = item.name.toLowerCase().trim();
    
    // Additional skill-specific filters
    const invalidSkillPatterns = [
      /^(using|working|developing|building|creating|managing|leading)$/i,
      /^(software|hardware|technology|tools|platforms|systems)$/i,
      /^(frontend|backend|fullstack|full-stack)$/i, // Too generic
      /^(web|mobile|desktop|cloud)$/i, // Too generic without context
    ];
    
    return !invalidSkillPatterns.some(pattern => pattern.test(name));
  });
};

// Enhanced certification filtering
const filterCertifications = (items: ExtractedItem[]): ExtractedItem[] => {
  const filtered = filterQualityData(items);
  
  return filtered.filter(item => {
    const name = item.name.toLowerCase().trim();
    
    // Keep only legitimate certifications
    const legitimateCertPatterns = [
      /aws|azure|gcp|google cloud/i,
      /cisco|ccna|ccnp|ccie/i,
      /oracle|microsoft|ibm/i,
      /pmp|scrum|agile|prince2/i,
      /cissp|cism|cisa|ceh|security\+/i,
      /comptia|network\+|a\+|linux\+/i,
      /certified|certificate|certification/i,
    ];
    
    return legitimateCertPatterns.some(pattern => pattern.test(name)) || 
           name.length > 5; // Allow longer certification names
  });
};

// Enhanced experience filtering
const filterExperience = (items: ExtractedItem[]): ExtractedItem[] => {
  const filtered = filterQualityData(items);
  
  return filtered.filter(item => {
    const name = item.name.toLowerCase().trim();
    
    // Keep only meaningful experience requirements
    const validExperiencePatterns = [
      /\d+.*year/i,
      /\d+.*month/i,
      /entry.level/i,
      /junior|senior|mid.level|intermediate/i,
      /minimum|maximum|at least|up to/i,
    ];
    
    return validExperiencePatterns.some(pattern => pattern.test(name));
  });
};

// Transform backend data to frontend format with enhanced filtering
const transformBackendData = (backendData: BackendReportData): ReportData => {
  return {
    skills: {
      title: backendData.skills?.title || "Top Technical Skills", // Use backend title, with fallback
      items: filterSkills(backendData.skills?.items || []),
    },
    certifications: {
      title: backendData.certifications?.title || "Most Valued Certifications", // Use backend title, with fallback
      items: filterCertifications(backendData.certifications?.items || []),
    },
    experience: {
      title: backendData.experience?.title || "Experience Requirements", // Use backend title, with fallback
      items: filterExperience(backendData.experience?.items || []),
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