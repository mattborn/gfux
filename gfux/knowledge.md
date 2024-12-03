# Gmail Email Export Utility

## Purpose
Extract sent emails from Gmail for reuse in email campaigns (e.g. Loops.so)

## Setup Required
1. Enable Gmail API in Google Cloud Console
2. Create OAuth 2.0 credentials and download as credentials.json
3. Place credentials.json in project root
4. Create .env file with necessary environment variables

## Technical Constraints
- Gmail API limits results to 500 emails per request
- Must use pagination to fetch more than 500 emails
- Token-based pagination required for large email sets
- Write data to JSON file in batches to:
  - Preserve progress if process is interrupted
  - Avoid memory issues with large datasets
  - Enable progress monitoring
  - Maintain data integrity during long-running exports
- Keep derived data (like email lists) in separate files from raw data
- Process exported data in memory to avoid duplicate file reads
- Keep derived data clean:
  - Remove duplicates from exported lists
  - Process data before writing to derived files
  - Maintain data integrity during exports
- Keep derived data clean:
  - Remove duplicates from exported lists
  - Process data before writing to derived files
  - Maintain data integrity during exports
- Keep derived data (like email lists) in separate files from raw data
- Process exported data in memory to avoid duplicate file reads

## Usage
```bash
node index.js
```

## Security Notes
- credentials.json and token.json should be in .gitignore
- Never commit .env file
