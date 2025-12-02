
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mexlrlmqzhqjuudawodg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1leGxybG1xemhxanV1ZGF3b2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MzMxNjEsImV4cCI6MjA4MDIwOTE2MX0.SeWoyJhAzlVh8SBUqI5uvAU8tKUSMh6GrhPGLI7rGlY'; // Using anon key for client-side like operations, or service role if needed for admin tasks. 
// Ideally for seeding we might want service role to bypass RLS if policies are strict, but 'anon' might work if policies allow insert or if we are just testing.
// However, usually seeding is done with service_role. Let's try anon first, if it fails we might need service role key which might not be in .env.local usually (it's SUPABASE_SERVICE_ROLE_KEY).
// Given the user context, they probably only have anon key in .env.local. Let's assume RLS allows insert or we are just simulating.
// Actually, RLS usually blocks inserts from anon. 
// Let's check if we can use the service role key if available, otherwise we might need to temporarily disable RLS or use the dashboard.
// But wait, the user asked me to "put data in database", implying I should do it.
// If I can't find the service role key, I will try with anon key.

const supabase = createClient(supabaseUrl, supabaseKey);

const games = [
    { name: 'Teamfight Tactics Mobile', slug: 'tft-mobile', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Where Winds Meet', slug: 'where-winds-meet', image_url: 'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?auto=format&fit=crop&q=80&w=1000' },
    { name: 'ROM: Classic', slug: 'rom-classic', image_url: 'https://images.unsplash.com/photo-1612287230217-969b698c8d13?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Lineage 2M', slug: 'lineage-2m', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Sword of Justice', slug: 'sword-of-justice', image_url: 'https://images.unsplash.com/photo-1531297461136-82lw9b285bb6?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Seven Knights Re:Birth', slug: 'seven-knights-rebirth', image_url: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Bleach: Soul Resonance', slug: 'bleach-soul-resonance', image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Delta Force PC', slug: 'delta-force-pc', image_url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Free Fire (TH)', slug: 'free-fire-th', image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1000' },
    { name: 'RoV (TH)', slug: 'rov-th', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Ghost Soul M (TH)', slug: 'ghost-soul-m-th', image_url: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Path of Exile 2', slug: 'path-of-exile-2', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Racing Master', slug: 'racing-master', image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Crystal of Atlan', slug: 'crystal-of-atlan', image_url: 'https://images.unsplash.com/photo-1531297461136-82lw9b285bb6?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Black Desert Online PC', slug: 'black-desert-online-pc', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Genshin Impact', slug: 'genshin-impact', image_url: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Honkai: Star Rail', slug: 'honkai-star-rail', image_url: 'https://images.unsplash.com/photo-1612287230217-969b698c8d13?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Valorant TH', slug: 'valorant-th', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Mobile Legends: Bang Bang', slug: 'mobile-legends', image_url: 'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Ragnarok Online', slug: 'ragnarok-online', image_url: 'https://images.unsplash.com/photo-1531297461136-82lw9b285bb6?auto=format&fit=crop&q=80&w=1000' },
    { name: 'PUBG Mobile (TH)', slug: 'pubg-mobile-th', image_url: 'https://images.unsplash.com/photo-1593305841991-05c29736f87e?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Point Blank', slug: 'point-blank', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Zenless Zone Zero', slug: 'zenless-zone-zero', image_url: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Dragonica Origin', slug: 'dragonica-origin', image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000' },
];

async function seedGames() {
    console.log('Seeding games...');

    for (const game of games) {
        const { data, error } = await supabase
            .from('games')
            .upsert({
                name: game.name,
                slug: game.slug,
                image_url: game.image_url,
                active: true
            }, { onConflict: 'slug' })
            .select();

        if (error) {
            console.error(`Error inserting ${game.name}:`, error.message);
        } else {
            console.log(`Inserted/Updated: ${game.name}`);
        }
    }

    console.log('Seeding complete!');
}

seedGames();
