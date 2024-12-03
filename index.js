const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const fs = require('fs').promises;
require('dotenv').config();

// Gmail API scopes needed
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

async function getSentEmails() {
  try {
    // Authenticate with OAuth2
    const auth = await authenticate({
      keyfilePath: 'credentials.json',
      scopes: SCOPES,
      // Add OAuth2 callback settings
      port: 3000,
      redirectUri: 'http://localhost:3000/oauth2callback'
    });

    const gmail = google.gmail({ version: 'v1', auth });
    
    // Get sent emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['SENT'],
      maxResults: 100 // Adjust as needed
    });

    const messages = response.data.messages || [];
    const emails = [];

    // Get full message details for each email
    for (const message of messages) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });
      
      const headers = email.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const to = headers.find(h => h.name === 'To')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      
      // Get email body
      let body = '';
      if (email.data.payload.parts) {
        const textPart = email.data.payload.parts.find(part => part.mimeType === 'text/plain');
        if (textPart && textPart.body.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString();
        }
      }

      emails.push({
        subject,
        to,
        date,
        body,
      });
    }

    // Save to JSON file
    await fs.writeFile('sent-emails.json', JSON.stringify(emails, null, 2));
    console.log(`Saved ${emails.length} emails to sent-emails.json`);

  } catch (error) {
    console.error('Error:', error);
  }
}

getSentEmails();
