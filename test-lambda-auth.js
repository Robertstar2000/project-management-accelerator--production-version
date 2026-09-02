// Test Lambda authentication
const API_URL = 'https://n342noj3bk.execute-api.us-east-1.amazonaws.com/Prod';

async function testRegister() {
    console.log('\n=== Testing Registration ===');
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser',
                email: 'test@example.com',
                password: 'testpass123'
            })
        });
        
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
        
        if (response.ok) {
            console.log('✅ Registration successful!');
            return data;
        } else {
            console.log('❌ Registration failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

async function testLogin() {
    console.log('\n=== Testing Login ===');
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpass123'
            })
        });
        
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
        
        if (response.ok) {
            console.log('✅ Login successful!');
            return data;
        } else {
            console.log('❌ Login failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

async function runTests() {
    console.log('Testing Lambda Authentication...');
    console.log('API URL:', API_URL);
    
    const user = await testRegister();
    if (user) {
        await testLogin();
    }
    
    console.log('\n=== Tests Complete ===');
}

runTests();
