
-- Seed Games Data
INSERT INTO public.games (name, slug, image_url, active) VALUES
('Teamfight Tactics Mobile', 'tft-mobile', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Where Winds Meet', 'where-winds-meet', 'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?auto=format&fit=crop&q=80&w=1000', true),
('ROM: Classic', 'rom-classic', 'https://images.unsplash.com/photo-1612287230217-969b698c8d13?auto=format&fit=crop&q=80&w=1000', true),
('Lineage 2M', 'lineage-2m', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Sword of Justice', 'sword-of-justice', 'https://images.unsplash.com/photo-1531297461136-82lw9b285bb6?auto=format&fit=crop&q=80&w=1000', true),
('Seven Knights Re:Birth', 'seven-knights-rebirth', 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=1000', true),
('Bleach: Soul Resonance', 'bleach-soul-resonance', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000', true),
('Delta Force PC', 'delta-force-pc', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1000', true),
('Free Fire (TH)', 'free-fire-th', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1000', true),
('RoV (TH)', 'rov-th', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Ghost Soul M (TH)', 'ghost-soul-m-th', 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=1000', true),
('Path of Exile 2', 'path-of-exile-2', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Racing Master', 'racing-master', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000', true),
('Crystal of Atlan', 'crystal-of-atlan', 'https://images.unsplash.com/photo-1531297461136-82lw9b285bb6?auto=format&fit=crop&q=80&w=1000', true),
('Black Desert Online PC', 'black-desert-online-pc', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Genshin Impact', 'genshin-impact', 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=1000', true),
('Honkai: Star Rail', 'honkai-star-rail', 'https://images.unsplash.com/photo-1612287230217-969b698c8d13?auto=format&fit=crop&q=80&w=1000', true),
('Valorant TH', 'valorant-th', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Mobile Legends: Bang Bang', 'mobile-legends', 'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?auto=format&fit=crop&q=80&w=1000', true),
('Ragnarok Online', 'ragnarok-online', 'https://images.unsplash.com/photo-1531297461136-82lw9b285bb6?auto=format&fit=crop&q=80&w=1000', true),
('PUBG Mobile (TH)', 'pubg-mobile-th', 'https://images.unsplash.com/photo-1593305841991-05c29736f87e?auto=format&fit=crop&q=80&w=1000', true),
('Point Blank', 'point-blank', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Zenless Zone Zero', 'zenless-zone-zero', 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=1000', true),
('Dragonica Origin', 'dragonica-origin', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000', true)
ON CONFLICT (slug) DO NOTHING;
