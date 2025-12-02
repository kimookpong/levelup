const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function checkTables() {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('.env.local file not found!');
            return;
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                envVars[key] = value;
            }
        });

        const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
        const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('Checking for packages table...');
        const { data, error } = await supabase.from('packages').select('*').limit(1);

        if (error) {
            console.error('Error querying packages:', error.message);
        } else {
            console.log('Packages table exists. Sample data:', data);
        }

    } catch (err) {
        console.error('Script execution error:', err);
    }
}

checkTables();
