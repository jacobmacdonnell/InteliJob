# Contributing to InteliJob

Thanks for your interest in contributing.

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

- Frontend: `npm run dev`
- Backend: `cd backend && python start.py`

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
