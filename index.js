const { authenticate } = require('@google-cloud/local-auth')
const { google } = require('googleapis')
const fs = require('fs').promises
require('dotenv').config()

// Gmail API scopes needed
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

async function getSentEmails() {
  try {
    // Clear existing sent-emails.json if it exists
    try {
      await fs.unlink('sent-emails.json')
      console.log('Cleared existing sent-emails.json')
    } catch (error) {
      // File doesn't exist, which is fine
    }

    // Authenticate with OAuth2
    const auth = await authenticate({
      keyfilePath: 'credentials.json',
      scopes: SCOPES,
      // Add OAuth2 callback settings
      port: 3000,
      redirectUri: 'http://localhost:3000/oauth2callback',
    })

    const gmail = google.gmail({ version: 'v1', auth })

    // Get sent emails with pagination
    let messages = []
    let pageToken = null
    
    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['SENT'],
        maxResults: 500,
        pageToken: pageToken
      })
      
      messages = messages.concat(response.data.messages || [])
      console.log(`Fetched ${messages.length} message headers...`)
      pageToken = response.data.nextPageToken
    } while (pageToken && messages.length < 3000)

    console.log('Starting to fetch full message details...')
    let emails = []
    try {
      // Load existing emails if file exists
      emails = JSON.parse(await fs.readFile('sent-emails.json', 'utf8'))
    } catch (error) {
      // File doesn't exist yet, start with empty array
      emails = []
    }

    // Get full message details for each email
    for (const [index, message] of messages.entries()) {
      if (index % 100 === 0) {
        console.log(`Processing message ${index + 1} of ${messages.length}...`)
      }
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      })

      const headers = email.data.payload.headers
      const subject = headers.find(h => h.name === 'Subject')?.value || ''
      const to = headers.find(h => h.name === 'To')?.value || ''
      const date = headers.find(h => h.name === 'Date')?.value || ''

      // Get email body
      let body = ''
      if (email.data.payload.parts) {
        const textPart = email.data.payload.parts.find(part => part.mimeType === 'text/plain')
        if (textPart && textPart.body.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString()
        }
      }

      emails.push({
        subject,
        to,
        date,
        body,
      })

      // Write to file every 100 emails
      if (emails.length % 100 === 0) {
        await fs.writeFile('sent-emails.json', JSON.stringify(emails, null, 2))
        console.log(`Saved ${emails.length} emails to sent-emails.json`)
      }
    }

    // Final save to catch any remaining emails
    await fs.writeFile('sent-emails.json', JSON.stringify(emails, null, 2))
    
    // Extract and write email addresses to separate file
    const emailAddresses = emails.map(email => email.to).join('\n')
    await fs.writeFile('email-addresses.txt', emailAddresses)
    console.log('Email addresses saved to email-addresses.txt')
    
    console.log(`Completed saving ${emails.length} emails to sent-emails.json`)
  } catch (error) {
    console.error('Error:', error)
  }
}

getSentEmails()
