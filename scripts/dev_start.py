#!/usr/bin/env python3
"""Start InteliJob frontend + backend together for local development."""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _kill(proc: subprocess.Popen | None) -> None:
    if not proc or proc.poll() is not None:
        return
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()


def main() -> int:
    parser = argparse.ArgumentParser(description="Run frontend and backend dev servers.")
    parser.add_argument("--frontend-only", action="store_true", help="Start only the frontend")
    parser.add_argument("--backend-only", action="store_true", help="Start only the backend")
    args = parser.parse_args()

    if args.frontend_only and args.backend_only:
        print("Choose only one of --frontend-only or --backend-only", file=sys.stderr)
        return 2

    backend_proc: subprocess.Popen | None = None
    frontend_proc: subprocess.Popen | None = None

    try:
        if not args.frontend_only:
            backend_proc = subprocess.Popen([sys.executable, "start.py"], cwd=ROOT / "backend")
            print("[dev] Backend starting at http://localhost:8000")
            time.sleep(1)

        if not args.backend_only:
            frontend_proc = subprocess.Popen(["npm", "run", "dev"], cwd=ROOT)
            print("[dev] Frontend starting at http://localhost:5173")

        print("[dev] Press Ctrl+C to stop")

        while True:
            if backend_proc and backend_proc.poll() is not None:
                print("[dev] Backend exited")
                return backend_proc.returncode or 1
            if frontend_proc and frontend_proc.poll() is not None:
                print("[dev] Frontend exited")
                return frontend_proc.returncode or 1
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\n[dev] Shutting down...")
        return 0
    finally:
        _kill(frontend_proc)
        _kill(backend_proc)


if __name__ == "__main__":
    raise SystemExit(main())
