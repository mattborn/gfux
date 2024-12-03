const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const fs = require('fs').promises;
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

async function getSentEmails() {
  try {
    console.log('Starting authentication...');
    const auth = await authenticate({
      keyfilePath: 'credentials.json',
      scopes: SCOPES,
      port: 3000,
      redirectUri: 'http://localhost:3000/oauth2callback',
      // Save token to disk for later program executions
      tokenPath: 'token.json'
    });

    const gmail = google.gmail({ version: 'v1', auth });
    console.log('Authentication successful');
    
    // Get sent emails from last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const query = 'in:sent';  // Simplify query to debug
    
    let messages = [];
    let pageToken;
    
    // Fetch pages until we have 1000 messages or run out of results
    do {
      console.log(`Fetching messages batch (current count: ${messages.length})...`);
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: Math.max(1, Math.min(500, 3000 - messages.length)),
        pageToken
      });
      
      const pageMessages = response.data.messages || [];
      messages.push(...pageMessages);
      pageToken = response.data.nextPageToken;
    } while (pageToken && messages.length < 3000);
    const emailSet = new Set();

    console.log(`Found ${messages.length} messages total, extracting email addresses...`);
    
    console.log(`Found ${messages.length} messages total, extracting email addresses...`);
    
    // Extract unique email addresses
    let processedCount = 0;
    for (const message of messages) {
      if (processedCount % 100 === 0) {
        console.log(`Processing message ${processedCount} of ${messages.length}...`);
      }
      processedCount++;
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

    console.log(`Found ${emailSet.size} unique email addresses`);
    
    // Save to file
    const emailList = Array.from(emailSet).join(', ');
    await fs.writeFile('email-list.txt', emailList);
    console.log(`Saved ${emailSet.size} unique email addresses to email-list.txt`);

  } catch (error) {
    console.error('Error:', error);
  }
}

getSentEmails();
