#!/usr/bin/env python3
"""Backend API smoke tests using an in-process test client."""

from __future__ import annotations

from collections.abc import Generator
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
