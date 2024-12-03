const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const fs = require('fs').promises;
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

async function getSentEmails() {
  try {
    const auth = await authenticate({
      keyfilePath: 'credentials.json',
      scopes: SCOPES,
      port: 3000,
      redirectUri: 'http://localhost:3000/oauth2callback'
    });

    const gmail = google.gmail({ version: 'v1', auth });
    
    // Get sent emails from last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const query = `after:${threeMonthsAgo.getTime() / 1000} in:sent`;
    
    let messages = [];
    let pageToken;
    
    // Fetch pages until we have 1000 messages or run out of results
    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: Math.min(500, 1000 - messages.length),
        pageToken
      });
      
      const pageMessages = response.data.messages || [];
      messages.push(...pageMessages);
      pageToken = response.data.nextPageToken;
    } while (pageToken && messages.length < 3000);
    const emailSet = new Set();

    // Extract unique email addresses
    for (const message of messages) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'metadata',
        metadataHeaders: ['To']
      });
      
      const toHeader = email.data.payload.headers.find(h => h.name === 'To');
      if (toHeader) {
        const addresses = toHeader.value.split(/[,;]/).map(addr => {
          const match = addr.match(/<(.+?)>/) || [null, addr.trim()];
          return match[1].trim();
        });
        addresses.forEach(addr => emailSet.add(addr));
      }
    }

    // Save to file
    const emailList = Array.from(emailSet).join(', ');
    await fs.writeFile('email-list.txt', emailList);
    console.log(`Saved ${emailSet.size} unique email addresses to email-list.txt`);

  } catch (error) {
    console.error('Error:', error);
  }
}

getSentEmails();
