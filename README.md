# Gmail Export Utility

Extract sent emails from Gmail for reuse in email campaigns.

## Setup

1. Enable Gmail API in Google Cloud Console
2. Create OAuth 2.0 credentials and download as `credentials.json`
3. Place `credentials.json` in project root
4. Create `.env` file with required environment variables
5. Install dependencies: `npm install`

## Usage

```bash
node index.js
```

This will:
1. Authenticate with Gmail API
2. Fetch your most recent sent emails
3. Save them to `sent-emails.json`
