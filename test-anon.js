import { createClient } from '@insforge/sdk';
import 'dotenv/config';

// Load env from the project .env.local
const insforge = createClient({
    baseUrl: process.env.VITE_INSFORGE_BASE_URL,
    anonKey: process.env.VITE_INSFORGE_ANON_KEY,
});

async function run() {
    console.log("Starting fetch...");
    const { data, error } = await insforge.database.from('store_settings').select('whatsapp_number').single();
    console.log("Data:", data);
    console.log("Error:", error);
}

run();
