// Quick test script for authentication endpoints
// Run with: node test-auth-endpoints.js

const BASE_URL = 'http://localhost:3001';

async function testPasswordReset() {
    console.log('\n=== Testing Password Reset ===');
    
    try {
        const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com' })
        });
        
        const data = await response.json();
        console.log('✓ Password reset request:', response.status, data);
    } catch (error) {
        console.error('✗ Password reset failed:', error.message);
    }
}

async function testAccountDeletion() {
    console.log('\n=== Testing Account Deletion ===');
    
    try {
        const response = await fetch(`${BASE_URL}/api/auth/delete-account/test-user-id`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        console.log('✓ Account deletion:', response.status, data);
    } catch (error) {
        console.error('✗ Account deletion failed:', error.message);
    }
}

async function runTests() {
    console.log('Testing authentication endpoints...');
    console.log('Make sure the backend server is running on port 3001\n');
    
    await testPasswordReset();
    await testAccountDeletion();
    
    console.log('\n=== Tests Complete ===');
    console.log('Check server console for email output');
}

runTests();
