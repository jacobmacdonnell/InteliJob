import axios from 'axios';
import type { JobCriteria, ReportData, ScanHistoryEntry } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 min for multi-query
  headers: { 'Content-Type': 'application/json' },
});

// ── Fetch Report ────────────────────────────────────────────────────────────

export const fetchReport = async (criteria: JobCriteria): Promise<ReportData> => {
  try {
    const response = await api.post('/analyze-jobs', {
      job_title: criteria.job_title,
      location: criteria.location || null,
      time_range: criteria.time_range || '1d',
    });

    const remaining = response.headers['x-ratelimit-remaining'];
    if (remaining !== undefined && parseInt(remaining) <= 5) {
      window.dispatchEvent(new CustomEvent('rateLimitWarning', {
        detail: { remaining: parseInt(remaining) }
      }));
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Analysis failed');
    }

    const d = response.data.data;
    if (!d?.certifications) {
      throw new Error('No certification data received');
    }

    return {
      certifications: {
        title: d.certifications.title || 'Certification Demand',
        items: d.certifications.items || [],
      },
      metadata: {
        total_jobs_found: d.total_jobs_found,
        jobs_with_descriptions: d.jobs_with_descriptions,
        queries_used: d.queries_used || [],
        search_criteria: d.search_criteria,
      },
      title_distribution: d.title_distribution || [],
      cert_pairs: d.cert_pairs || [],
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const msg = error.response?.data?.detail || error.message;

      if (status === 408) throw new Error('Request timeout — try again.');
      if (status === 429) {
        window.dispatchEvent(new CustomEvent('rateLimitWarning', { detail: { remaining: 0 } }));
        throw new Error('Rate limit exceeded. Wait a moment.');
      }
      if (status === 500) throw new Error('Server error. Try again later.');
      if (!error.response) throw new Error('Cannot connect to backend. Is it running?');
      throw new Error(`Analysis failed (${status}): ${msg}`);
    }
    throw new Error(error.message || 'Unexpected error during analysis.');
  }
};

// ── Fetch History ───────────────────────────────────────────────────────────

export const fetchHistory = async (): Promise<ScanHistoryEntry[]> => {
  try {
    const response = await api.get('/history');
    return response.data.history || [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

// ── Health Check ────────────────────────────────────────────────────────────

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.data.status === 'healthy';
  } catch {
    return false;
  }
};