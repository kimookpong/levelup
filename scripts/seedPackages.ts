
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mexlrlmqzhqjuudawodg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1leGxybG1xemhxanV1ZGF3b2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MzMxNjEsImV4cCI6MjA4MDIwOTE2MX0.SeWoyJhAzlVh8SBUqI5uvAU8tKUSMh6GrhPGLI7rGlY';

const supabase = createClient(supabaseUrl, supabaseKey);

const rovPackages = [
    { name: '37 Coupons', price: 35 },
    { name: '115 Coupons', price: 100 },
    { name: '240 Coupons', price: 200 },
    { name: '370 Coupons', price: 300 },
    { name: '610 Coupons', price: 500 },
    { name: '1,250 Coupons', price: 1000 },
    { name: '2,550 Coupons', price: 2000 },
    { name: '3,900 Coupons', price: 3000 },
];

async function seedPackages() {
    console.log('Seeding ROV packages...');

    // 1. Get Game ID for ROV
    const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('slug', 'rov-th')
        .single();

    if (gameError || !game) {
        console.error('Error finding ROV game:', gameError?.message);
        return;
    }

    console.log(`Found ROV Game ID: ${game.id}`);

    // 2. Delete existing packages for this game to avoid duplicates
    const { error: deleteError } = await supabase
        .from('packages')
        .delete()
        .eq('game_id', game.id);

    if (deleteError) {
        console.error('Error deleting existing packages:', deleteError.message);
    }

    // 3. Insert Packages
    for (const pkg of rovPackages) {
        const { error } = await supabase
            .from('packages')
            .insert({
                game_id: game.id,
                name: pkg.name,
                price: pkg.price,
                active: true
            })
            .select();

        if (error) {
            // If upsert fails due to no unique constraint, try simple insert or ignore
            console.error(`Error inserting ${pkg.name}:`, error.message);
        } else {
            console.log(`Inserted/Updated: ${pkg.name}`);
        }
    }

    console.log('Seeding complete!');
}

seedPackages();
