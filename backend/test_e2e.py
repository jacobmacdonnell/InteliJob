#!/usr/bin/env python3
"""Backend API smoke tests using an in-process test client."""

from fastapi.testclient import TestClient
import main


client = TestClient(main.app)


def test_health() -> None:
    """Health endpoint should respond with service metadata."""
    response = client.get('/health')
    response.raise_for_status()

    data = response.json()
    assert data['status'] == 'healthy'
    assert 'version' in data


def test_analyze() -> None:
    """Analyze endpoint should return parsed certification data."""

    async def fake_fetch_jobs_expanded(job_title: str, location: str = None, date_posted: str = 'today'):
        return ([{
            'job_title': 'Cybersecurity Analyst',
            'company_name': 'Acme Corp',
            'job_description': 'Candidates should hold Security+ and CySA+ certifications.',
            'job_url': 'https://example.com/job/1',
        }], [job_title])

    original = main.fetch_jobs_expanded
    main.fetch_jobs_expanded = fake_fetch_jobs_expanded
    try:
        response = client.post('/analyze-jobs', json={
            'job_title': 'Cybersecurity Analyst',
            'time_range': '1d',
        })
    finally:
        main.fetch_jobs_expanded = original

    response.raise_for_status()
    data = response.json()

    assert data['success'] is True
    cert_items = data['data']['certifications']['items']
    assert len(cert_items) >= 1
    assert any(item['name'] in {'Security+', 'CySA+'} for item in cert_items)
