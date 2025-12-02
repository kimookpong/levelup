const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function checkSchema() {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            }
        });

        const supabase = createClient(envVars['NEXT_PUBLIC_SUPABASE_URL'], envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

        // Insert a dummy package to see if it fails on missing columns or constraints
        // This is a bit hacky but effective if we don't have schema access
        const { error } = await supabase.from('packages').insert({
            name: 'Test Package',
            price: 100,
            currency: 'THB',
            game_id: '00000000-0000-0000-0000-000000000000' // UUID format
        });

        if (error) {
            console.log('Insert error (expected):', error.message);
        }

    } catch (err) {
        console.error(err);
    }
}

checkSchema();
