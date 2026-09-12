-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO public.categories (name, slug, emoji, sort_order) VALUES
  ('Salads', 'salads', '🥗', 1),
  ('Juices', 'juices', '🧃', 2),
  ('Protein Shakes', 'protein-shakes', '💪', 3),
  ('Protein Meals', 'protein-meals', '🍽️', 4),
  ('Healthy Snacks', 'healthy-snacks', '🍪', 5),
  ('Desserts', 'desserts', '🍫', 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed menu items
INSERT INTO public.menu_items (category_id, name, slug, description, price, calories, protein_g, carbs_g, fat_g, fiber_g, is_vegan, is_gluten_free, is_available, tags, sort_order)
VALUES
  -- Salads
  ((SELECT id FROM public.categories WHERE slug = 'salads'),
   'Mediterranean Power Bowl', 'mediterranean-power-bowl',
   'Organic quinoa, spiced chickpeas, baby cucumber, cherry tomatoes, kalamata olives, vegan herb dressing.',
   299.00, 380, 18.5, 42.0, 14.0, 9.0, true, true, true, ARRAY['High Protein', 'Gluten Free'], 1),
  ((SELECT id FROM public.categories WHERE slug = 'salads'),
   'Smoked Tofu & Edamame Crunch', 'smoked-tofu-edamame-crunch',
   'Crispy smoked tofu, organic edamame, shredded purple cabbage, sesame seed crust, tamari ginger vinaigrette.',
   329.00, 410, 24.0, 31.0, 16.0, 8.0, true, true, true, ARRAY['High Protein', 'Bestseller'], 2),
  ((SELECT id FROM public.categories WHERE slug = 'salads'),
   'Avocado Quinoa Garden Feast', 'avocado-quinoa-garden-feast',
   'Hass avocado slices, tri-color quinoa, baby spinach, toasted sunflower seeds, zesty lemon herb dressing.',
   349.00, 440, 15.0, 38.0, 22.0, 11.0, true, true, true, ARRAY['Heart Healthy', 'Keto Friendly'], 3),

  -- Juices
  ((SELECT id FROM public.categories WHERE slug = 'juices'),
   'Ruby Glow Cold-Pressed', 'ruby-glow-cold-pressed',
   'Beetroot, crisp organic apple, carrot, valencia orange, and cold-pressed ginger root.',
   189.00, 140, 3.0, 32.0, 0.5, 4.0, true, true, true, ARRAY['Detox', 'Cold-Pressed'], 1),
  ((SELECT id FROM public.categories WHERE slug = 'juices'),
   'Emerald Detox Elixir', 'emerald-detox-elixir',
   'Baby spinach, celery, green apple, cucumber, mint leaves, and fresh lime.',
   199.00, 110, 2.5, 24.0, 0.5, 3.5, true, true, true, ARRAY['Low Calorie', 'Immunity'], 2),
  ((SELECT id FROM public.categories WHERE slug = 'juices'),
   'Golden Immunity Shot & Juice', 'golden-immunity-juice',
   'Raw turmeric, ginger, fresh pineapple, black pepper extract, and valencia orange.',
   179.00, 130, 2.0, 29.0, 0.5, 2.0, true, true, true, ARRAY['Anti-inflammatory'], 3),

  -- Protein Shakes
  ((SELECT id FROM public.categories WHERE slug = 'protein-shakes'),
   'Dark Chocolate Fuel Shake', 'dark-chocolate-fuel-shake',
   'Raw cacao nibs, plant protein isolate, unsweetened almond milk, chia seeds, and medjool dates.',
   259.00, 310, 28.0, 26.0, 8.0, 6.0, true, true, true, ARRAY['Post-Workout', '30g Protein'], 1),
  ((SELECT id FROM public.categories WHERE slug = 'protein-shakes'),
   'Berry Nitro Recovery', 'berry-nitro-recovery',
   'Wild blueberries, raspberries, cold-pressed whey/plant protein, coconut water, and flax seeds.',
   279.00, 290, 26.0, 28.0, 6.0, 7.0, true, true, true, ARRAY['Antioxidant Rich'], 2),

  -- Protein Meals
  ((SELECT id FROM public.categories WHERE slug = 'protein-meals'),
   'Herb-Roasted Paneer Power Bowl', 'herb-roasted-paneer-power-bowl',
   'Grilled artisanal paneer cubes, spiced brown rice, roasted broccoli florets, creamy tahini drizzle.',
   349.00, 480, 27.0, 45.0, 19.0, 7.5, false, true, true, ARRAY['High Protein', 'Vegetarian'], 1),
  ((SELECT id FROM public.categories WHERE slug = 'protein-meals'),
   'Lentil & Sweet Potato Protein Hash', 'lentil-sweet-potato-protein-hash',
   'Beluga lentils, roasted sweet potatoes, sauteed baby kale, garlic turmeric hummus.',
   299.00, 420, 21.0, 52.0, 11.0, 12.0, true, true, true, ARRAY['Complex Carbs', 'Vegan'], 2),

  -- Healthy Snacks
  ((SELECT id FROM public.categories WHERE slug = 'healthy-snacks'),
   'Raw Superseed Energy Bites', 'raw-superseed-energy-bites',
   'Pumpkin seeds, chia seeds, rolled oats, raw honey or agave, dark chocolate drizzles (3 pcs).',
   149.00, 210, 8.0, 22.0, 9.0, 5.0, true, true, true, ARRAY['No Added Sugar'], 1),

  -- Desserts
  ((SELECT id FROM public.categories WHERE slug = 'desserts'),
   'Avocado Cacao Mousse Cup', 'avocado-cacao-mousse-cup',
   'Whipped Hass avocado, raw organic cacao, pure maple syrup, crushed roasted pistachios.',
   189.00, 230, 5.0, 18.0, 14.0, 6.0, true, true, true, ARRAY['Guilt-Free', 'Vegan'], 1)
ON CONFLICT (slug) DO NOTHING;

-- Seed subscription plans
INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_quarterly, meals_per_week, is_popular, features, sort_order)
VALUES
  ('Starter Plan', 'starter-plan', 'Perfect for introducing clean, balanced meals into your busy week.',
   2499.00, 6999.00, 3, false,
   '["3 chef-curated meals per week", "Free insulated temperature delivery", "Full menu customization", "Pause or skip anytime"]'::jsonb, 1),
  ('Power Plan', 'power-plan', 'Our most popular subscription for consistent health, fitness, and vitality.',
   3999.00, 10999.00, 5, true,
   '["5 meals per week (Mon–Fri)", "Priority delivery slots", "Complimentary cold-pressed juice weekly", "Dietary preference customization", "Dedicated WhatsApp wellness manager"]'::jsonb, 2),
  ('Ultimate Lifestyle', 'ultimate-lifestyle', 'Comprehensive 7-day health transformation with zero prep work.',
   5999.00, 16499.00, 7, false,
   '["7 meals per week (complete coverage)", "2 cold-pressed juices & snacks included", "VIP direct delivery", "Quarterly nutritionist consult", "Exclusive seasonal secret menu access"]'::jsonb, 3)
ON CONFLICT (slug) DO NOTHING;
