// Test login issue
const API_URL = 'https://n342noj3bk.execute-api.us-east-1.amazonaws.com/Prod';

async function testLoginIssue() {
    const testUser = {
        username: 'debuguser',
        email: 'debug@test.com',
        password: 'testpass123'
    };
    
    console.log('1. Registering user...');
    const registerRes = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
    });
    const registerData = await registerRes.json();
    console.log('Register response:', registerRes.status, registerData);
    
    console.log('\n2. Attempting login with same credentials...');
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
        })
    });
    const loginData = await loginRes.json();
    console.log('Login response:', loginRes.status, loginData);
    
    if (!loginRes.ok) {
        console.log('\n❌ Login failed! This indicates password comparison issue.');
        console.log('Stored password:', registerData.password || 'not returned');
        console.log('Login password:', testUser.password);
    } else {
        console.log('\n✅ Login succeeded!');
    }
}

testLoginIssue();
