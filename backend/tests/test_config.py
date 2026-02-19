from __future__ import annotations

from config import Settings


def test_settings_parses_cors_origins_from_env(monkeypatch):
    monkeypatch.setenv(
        "CORS_ORIGINS",
        "https://intelijob.app, https://www.intelijob.app  ,http://localhost:5173",
    )

    settings = Settings()

    assert settings.cors_origins == [
        "https://intelijob.app",
        "https://www.intelijob.app",
        "http://localhost:5173",
    ]


def test_settings_uses_default_cors_origins_when_env_missing(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)

    settings = Settings()

    assert "http://localhost:5173" in settings.cors_origins
    assert "http://localhost:3000" in settings.cors_origins


def test_settings_uses_loopback_host_by_default(monkeypatch):
    monkeypatch.delenv("HOST", raising=False)

    settings = Settings()

    assert settings.host == "127.0.0.1"


def test_settings_allows_host_override(monkeypatch):
    monkeypatch.setenv("HOST", "0.0.0.0")

    settings = Settings()

    assert settings.host == "0.0.0.0"
