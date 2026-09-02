// Test email endpoint
const testEmail = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: 'mifecoinc@gmail.com',
                subject: 'Test Email from AWS SES',
                body: '<p>This is a test email from AWS SES integration.</p><p>If you receive this, AWS SES is working correctly!</p>'
            })
        });
        
        const data = await response.json();
        console.log('Response:', response.status, data);
        
        if (response.ok) {
            console.log('✅ Email sent successfully!');
            console.log('Check mifecoinc@gmail.com inbox');
        } else {
            console.log('❌ Email failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Request failed:', error.message);
        console.log('\nMake sure backend is running: cd server && npm start');
    }
};

testEmail();
