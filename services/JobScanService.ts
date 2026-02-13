import axios from 'axios';
import type { JobCriteria, ReportData, BackendReportData, ExtractedItem } from '../types';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = 60000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// ── Quality Filters (for skills/experience/education only — NOT certs) ──────

const filterQualityData = (items: ExtractedItem[]): ExtractedItem[] => {
  if (!items || items.length === 0) return [];

  return items.filter(item => {
    if (item.count < 1) return false;
    if (!item.name || item.name.trim().length < 2) return false;

    const lowercaseName = item.name.toLowerCase().trim();
    const nonsensicalPatterns = [
      /^[a-z]{1,2}$/i,
      /^\d+$/,
      /^[^a-zA-Z0-9\s]+$/,
      /^(and|or|the|a|an|in|on|at|to|for|of|with|by|from)$/i,
      /^(work|job|role|position|candidate|team|company|business)$/i,
      /^(good|great|excellent|strong|solid|basic|advanced|senior|junior)$/i,
      /^(ability|knowledge|understanding|experience|skills)$/i,
      /^(preferred|required|must|should|nice|plus|bonus)$/i,
      /^(years?|months?|days?|hours?)$/i,
    ];

    if (nonsensicalPatterns.some(pattern => pattern.test(lowercaseName))) return false;
    if (item.name.length > 100) return false;
    return true;
  }).slice(0, 15);
};

const filterSkills = (items: ExtractedItem[]): ExtractedItem[] => {
  const filtered = filterQualityData(items);
  return filtered.filter(item => {
    const name = item.name.toLowerCase().trim();
    const invalidSkillPatterns = [
      /^(using|working|developing|building|creating|managing|leading)$/i,
      /^(software|hardware|technology|tools|platforms|systems)$/i,
      /^(frontend|backend|fullstack|full-stack)$/i,
      /^(web|mobile|desktop|cloud)$/i,
    ];
    return !invalidSkillPatterns.some(pattern => pattern.test(name));
  });
};

const filterExperience = (items: ExtractedItem[]): ExtractedItem[] => {
  const filtered = filterQualityData(items);
  return filtered.filter(item => {
    const name = item.name.toLowerCase().trim();
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

// ── Transform — certs pass straight through, no double-filtering ────────────

const transformBackendData = (backendData: BackendReportData): ReportData => {
  return {
    // Certs: NO filtering — backend dictionary extraction is authoritative
    certifications: {
      title: backendData.certifications?.title || "Top Certifications",
      items: backendData.certifications?.items || [],
    },
    skills: {
      title: backendData.skills?.title || "Top Technical Skills",
      items: filterSkills(backendData.skills?.items || []),
    },
    experience: {
      title: backendData.experience?.title || "Experience Requirements",
      items: filterExperience(backendData.experience?.items || []),
    },
    education: {
      title: backendData.education?.title || "Education Requirements",
      items: filterQualityData(backendData.education?.items || []),
    },
    metadata: {
      total_jobs_found: backendData.total_jobs_found,
      jobs_with_descriptions: backendData.jobs_with_descriptions,
      search_criteria: backendData.search_criteria,
    },
  };
};

// ── API Calls ───────────────────────────────────────────────────────────────

export const fetchReport = async (criteria: JobCriteria): Promise<ReportData> => {
  try {
    console.log("Fetching job analysis from backend API:", criteria);

    const response = await apiClient.post('/analyze-jobs', {
      job_title: criteria.job_title,
      location: criteria.location || null,
      time_range: criteria.time_range || '1d',
    });

    // Rate limit warning
    const remaining = response.headers['x-ratelimit-remaining'];
    if (remaining !== undefined) {
      const remainingCount = parseInt(remaining);
      if (remainingCount <= 5) {
        window.dispatchEvent(new CustomEvent('rateLimitWarning', {
          detail: { remaining: remainingCount }
        }));
      }
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Job analysis failed');
    }

    if (!response.data.data) {
      throw new Error('No data received from the analysis');
    }

    const data = response.data.data;
    if (!data.skills || !data.certifications || !data.experience || !data.education) {
      throw new Error('Invalid data structure received from the analysis');
    }

    return transformBackendData(data);

  } catch (error: any) {
    console.error("Job analysis failed:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.detail || error.response.data?.message || error.message;

        if (status === 408) {
          throw new Error("Request timeout - the analysis is taking too long. Please try again.");
        } else if (status === 500) {
          throw new Error("Server error occurred during analysis. Please try again later.");
        } else if (status === 400) {
          throw new Error(`Invalid request: ${errorMessage}`);
        } else if (status === 429) {
          window.dispatchEvent(new CustomEvent('rateLimitWarning', { detail: { remaining: 0 } }));
          throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
        } else if (status === 401 || status === 403) {
          throw new Error("Authentication error. Please check your API configuration.");
        } else {
          throw new Error(`Analysis failed (${status}): ${errorMessage}`);
        }
      } else if (error.request) {
        throw new Error("Unable to connect to the analysis service. Please check your connection and ensure the backend is running.");
      }
    }

    throw new Error(error.message || "An unexpected error occurred during job analysis.");
  }
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health');
    return response.data.status === 'healthy';
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};