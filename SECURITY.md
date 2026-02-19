# Security Policy

## Supported Versions

This project is maintained on a best-effort basis. Security fixes are applied to the latest `main` branch.

## Reporting a Vulnerability

Please do **not** file public GitHub issues for sensitive security reports.

Use one of these private channels instead:

1. **GitHub Security Advisory (preferred):** open a private vulnerability report in this repository's **Security** tab.
2. **Direct maintainer contact:** if Security Advisories are unavailable, contact the maintainer privately and include `[SECURITY]` in the subject.

Include:

- A clear description of the issue
- Reproduction steps or proof of concept
- Potential impact
- Any suggested mitigation

## Secret Handling

- Never commit `.env` files or API keys.
- Use `.env.example` templates for local configuration.
- Rotate API keys immediately if accidental exposure is suspected.
