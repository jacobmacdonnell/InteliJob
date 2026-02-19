# Contributing to InteliJob

Thanks for your interest in contributing.

## Scope and expectations

This is a personal project shared for community use. Contributions are welcome, but review/merge timing is best-effort.

Great contribution types:
- bug fixes
- extraction/ranking improvements
- docs/usability improvements
- tests for edge cases in job parsing

## Development setup

1. Fork the repository and clone your fork.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
4. Copy env templates and configure secrets:
   ```bash
   cp .env.example .env.local
   cp backend/.env.example backend/.env
   ```

## Run locally

- Build the standalone app: `python build_app.py`
- Frontend only: `npm run dev:frontend`
- Backend only: `npm run dev:backend`

## Validate changes

Run the full project checks before opening a PR:

```bash
npm run check:fullstack
```

## Pull request guidelines

- Keep PRs focused and reasonably small.
- Add or update tests for behavior changes.
- Update documentation when changing setup or public behavior.
- Never commit secrets, API keys, or personal data exports.
