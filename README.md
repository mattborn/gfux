# Gmail Export Utility

Extract unique email addresses from Gmail sent emails.

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
2. Fetch sent emails from the last 3 months
3. Extract unique recipient email addresses
4. Save them as a comma-delimited list to `email-list.txt`
