# Security Policy

## Supported Versions

This project is maintained on a best-effort basis. Security fixes are applied to the latest main branch.

## Reporting a Vulnerability

Please do **not** file public GitHub issues for sensitive security reports.

Instead, email: `security@intelijob.local` with:

- A clear description of the issue
- Reproduction steps or proof of concept
- Potential impact

You should receive an acknowledgement within 72 hours.

## Secret Handling

- Never commit `.env` files or API keys.
- Use `.env.example` templates for local configuration.
- Rotate API keys immediately if accidental exposure is suspected.
