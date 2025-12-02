DO $$
DECLARE
  target_game_id uuid;
BEGIN
  -- Get Game ID for ROV
  SELECT id INTO target_game_id FROM games WHERE slug = 'rov-th';

  IF target_game_id IS NOT NULL THEN
    -- Delete existing packages for this game to avoid duplicates
    DELETE FROM packages WHERE game_id = target_game_id;

    -- Insert Packages
    INSERT INTO packages (game_id, name, price, active) VALUES
    (target_game_id, '37 Coupons', 35, true),
    (target_game_id, '115 Coupons', 100, true),
    (target_game_id, '240 Coupons', 200, true),
    (target_game_id, '370 Coupons', 300, true),
    (target_game_id, '610 Coupons', 500, true),
    (target_game_id, '1,250 Coupons', 1000, true),
    (target_game_id, '2,550 Coupons', 2000, true),
    (target_game_id, '3,900 Coupons', 3000, true);
    
    RAISE NOTICE 'Seeded packages for ROV (TH)';
  ELSE
    RAISE NOTICE 'Game ROV (TH) not found';
  END IF;
END $$;
