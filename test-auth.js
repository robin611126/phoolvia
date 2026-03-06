import { createClient } from '@insforge/sdk';

const insforge = createClient({
    baseUrl: 'https://62psi7hb.ap-southeast.insforge.app',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODI4ODl9.nOMNl4Oufs_buseDER6sGzSy9LNwUuh4m0RSMnCyWe8',
});

async function run() {
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'Password@123!';

    console.log(`Signing up with ${email}...`);
    const signUpRes = await insforge.auth.signUp({
        email,
        password,
    });

    if (signUpRes.error) {
        console.log('Sign up failed:', signUpRes.error);
        return;
    }

    console.log('Sign up succeeded:', JSON.stringify(signUpRes.data, null, 2));

    console.log('Now logging in with the same credentials...');
    const signInRes = await insforge.auth.signInWithPassword({
        email,
        password,
    });

    if (signInRes.error) {
        console.log('Sign in failed:', JSON.stringify(signInRes.error, null, 2));
    } else {
        console.log('Sign in succeeded for:', signInRes.data.user?.email);
        console.log('Access token exists:', !!signInRes.data.accessToken);
    }
}

run();
