# Gmail Export Utility

## Purpose
Extract unique email addresses from Gmail sent folder for reuse in email campaigns

## Core Requirements
- Only extract recipient email addresses (not full email content)
- Filter to last 3 months of sent emails
- Output as comma-delimited list
- Deduplicate addresses

## Setup Required
1. Enable Gmail API in Google Cloud Console
2. Create OAuth 2.0 credentials and download as credentials.json
3. Place credentials.json in project root
4. Create .env file with necessary environment variables

## Security Notes
- credentials.json and token.json should be in .gitignore
- Never commit .env file
