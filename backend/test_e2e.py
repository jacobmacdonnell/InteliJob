#!/usr/bin/env python3
"""Backend API smoke tests using an in-process test client."""

from __future__ import annotations

from collections.abc import Generator
from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys

import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import main  # noqa: E402


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    """Create an isolated API test client."""
    with TestClient(main.app) as api_client:
        yield api_client


def test_health(client: TestClient) -> None:
    """Health endpoint should respond with service metadata."""
    response = client.get('/health')
    response.raise_for_status()

    data = response.json()
    assert data['status'] == 'healthy'
    assert 'version' in data


def test_analyze(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """Analyze endpoint should return parsed certification data."""

    async def fake_fetch_jobs_expanded(
        job_title: str,
        location: str | None = None,
        date_posted: str = 'today',
    ):
        return ([{
            'job_title': 'Cybersecurity Analyst',
            'company_name': 'Acme Corp',
            'job_description': 'Candidates should hold Security+ and CySA+ certifications.',
            'job_url': 'https://example.com/job/1',
        }], [job_title])

    monkeypatch.setattr(main, 'fetch_jobs_expanded', fake_fetch_jobs_expanded)

    response = client.post('/analyze-jobs', json={
        'job_title': 'Cybersecurity Analyst',
        'time_range': '1d',
    })

    response.raise_for_status()
    data = response.json()

    assert data['success'] is True
    cert_items = data['data']['certifications']['items']
    assert len(cert_items) >= 1
    assert any(item['name'] in {'Security+', 'CySA+'} for item in cert_items)


def test_time_range_mapping_30d_uses_month(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """30-day time range should map to the API's `month` filter, not `all`."""
    captured: dict[str, str | None] = {}

    async def fake_fetch_jobs_expanded(
        job_title: str,
        location: str | None = None,
        date_posted: str = 'today',
    ):
        captured['date_posted'] = date_posted
        return ([], [job_title])

    monkeypatch.setattr(main, 'fetch_jobs_expanded', fake_fetch_jobs_expanded)

    response = client.post('/analyze-jobs', json={
        'job_title': 'Cybersecurity Analyst',
        'time_range': '30d',
    })

    response.raise_for_status()
    data = response.json()

    assert data['success'] is False
    assert captured['date_posted'] == 'month'


def test_filter_jobs_by_time_range_filters_old_timestamped_jobs() -> None:
    """Local filtering should remove jobs older than the requested window."""
    now = datetime.now(timezone.utc)
    jobs = [
        {
            'job_title': 'Recent Role',
            'job_posted_at_datetime_utc': (now - timedelta(days=5)).isoformat(),
        },
        {
            'job_title': 'Old Role',
            'job_posted_at_datetime_utc': (now - timedelta(days=40)).isoformat(),
        },
    ]

    filtered = main.filter_jobs_by_time_range(jobs, '30d')

    assert len(filtered) == 1
    assert filtered[0]['job_title'] == 'Recent Role'


def test_filter_jobs_by_time_range_keeps_unknown_timestamps() -> None:
    """Jobs without a parseable timestamp should be preserved."""
    jobs = [{'job_title': 'Unknown Date Role'}]

    filtered = main.filter_jobs_by_time_range(jobs, '14d')

    assert filtered == jobs


def test_rank_certs_counts_distinct_jobs_same_title_company() -> None:
    """Distinct postings with same title/company should count as separate jobs."""
    items = [
        {
            'name': 'Security+',
            'full_name': 'CompTIA Security+',
            'org': 'CompTIA',
            'source_job': 'Cybersecurity Analyst at Acme Corp',
            'company': 'Acme Corp',
            'job_url': 'https://example.com/job/1',
            'job_key': 'job-1',
        },
        {
            'name': 'Security+',
            'full_name': 'CompTIA Security+',
            'org': 'CompTIA',
            'source_job': 'Cybersecurity Analyst at Acme Corp',
            'company': 'Acme Corp',
            'job_url': 'https://example.com/job/2',
            'job_key': 'job-2',
        },
    ]

    ranked = main.rank_certs(items, total_jobs=2, top_n=15)

    assert ranked[0]['count'] == 2
    assert ranked[0]['percentage'] == 100.0


def test_analyze_counts_duplicate_title_company_postings_separately(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Analyze should not collapse two different postings into one cert mention."""

    async def fake_fetch_jobs_expanded(
        job_title: str,
        location: str | None = None,
        date_posted: str = 'today',
    ):
        return ([
            {
                'job_id': 'job-1',
                'job_title': 'Cybersecurity Analyst',
                'company_name': 'Acme Corp',
                'job_description': 'Security+ required',
                'job_url': 'https://example.com/job/1',
            },
            {
                'job_id': 'job-2',
                'job_title': 'Cybersecurity Analyst',
                'company_name': 'Acme Corp',
                'job_description': 'Security+ preferred',
                'job_url': 'https://example.com/job/2',
            },
        ], [job_title])

    monkeypatch.setattr(main, 'fetch_jobs_expanded', fake_fetch_jobs_expanded)

    response = client.post('/analyze-jobs', json={
        'job_title': 'Cybersecurity Analyst',
        'time_range': '1d',
    })

    response.raise_for_status()
    data = response.json()

    assert data['success'] is True
    sec = next(item for item in data['data']['certifications']['items'] if item['name'] == 'Security+')
    assert sec['count'] == 2


@pytest.mark.anyio
async def test_fetch_jobs_expanded_does_not_collapse_same_title_company_without_job_id(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Fallback dedup should keep distinct postings when only URL differs."""

    async def fake_fetch_jobs_single(client, query: str, location: str | None = None, date_posted: str = 'today'):
        return [
            {
                'job_title': 'Cybersecurity Analyst',
                'company_name': 'Acme Corp',
                'employer_name': 'Acme Corp',
                'job_url': 'https://example.com/job/1',
            },
            {
                'job_title': 'Cybersecurity Analyst',
                'company_name': 'Acme Corp',
                'employer_name': 'Acme Corp',
                'job_url': 'https://example.com/job/2',
            },
        ]

    monkeypatch.setattr(main, 'RAPIDAPI_KEY', 'test-key')
    monkeypatch.setattr(main, 'get_search_queries', lambda title: [title])
    monkeypatch.setattr(main, 'fetch_jobs_single', fake_fetch_jobs_single)

    jobs, _queries = await main.fetch_jobs_expanded('Cybersecurity Analyst')

    assert len(jobs) == 2


def test_filter_jobs_by_time_range_handles_millisecond_timestamps() -> None:
    """Millisecond timestamps should be parsed correctly for cutoff filtering."""
    now = datetime.now(timezone.utc)
    recent_ms = int((now - timedelta(days=2)).timestamp() * 1000)
    old_ms = int((now - timedelta(days=45)).timestamp() * 1000)
    jobs = [
        {'job_title': 'Recent Millis', 'job_posted_at_timestamp': recent_ms},
        {'job_title': 'Old Millis', 'job_posted_at_timestamp': old_ms},
    ]

    filtered = main.filter_jobs_by_time_range(jobs, '30d')

    assert [j['job_title'] for j in filtered] == ['Recent Millis']


def test_compute_title_distribution_normalizes_case_and_spacing() -> None:
    jobs = [
        {'job_title': 'SOC Analyst'},
        {'job_title': 'soc analyst'},
        {'job_title': ' SOC   Analyst '},
        {'job_title': 'Security Engineer'},
    ]

    dist = main.compute_title_distribution(jobs)

    assert dist[0]['title'] == 'SOC Analyst'
    assert dist[0]['count'] == 3
    assert dist[0]['percentage'] == 75.0
