const BACKEND_URL = 'https://n342noj3bk.execute-api.us-east-1.amazonaws.com/Prod';

async function testEmail() {
  console.log('Testing email send to robertstar2000@gmail.com...\n');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'robertstar2000@gmail.com',
        subject: 'Test Email from Project Management App',
        body: '<h1>Test Email</h1><p>This is a test email from your project management application.</p><p>If you received this, the email integration is working correctly!</p>'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('Response:', data);
    } else {
      console.log('❌ Email failed');
      console.log('Error:', data);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

testEmail();
