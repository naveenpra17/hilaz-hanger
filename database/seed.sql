-- Seed data (passwords: Admin@123 / Customer@123 — BCrypt hashes below are placeholders; backend seeds on startup)

INSERT INTO categories (id, name, slug, sort_order) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Dresses', 'dresses', 1),
    ('a0000000-0000-0000-0000-000000000002', 'Tops', 'tops', 2),
    ('a0000000-0000-0000-0000-000000000003', 'Bottoms', 'bottoms', 3),
    ('a0000000-0000-0000-0000-000000000004', 'Sets', 'sets', 4)
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, slug, description, fabric, color_info, price, compare_at_price, category_id, labels, sizes, colors, active) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Urban Ease Mulmul Set', 'urban-ease-mulmul-set',
     'Premium Mulmul Cotton Set. Oversized button-down shirt with relaxed wide-leg pants. Breathable and elegant.',
     'Premium Mulmul Cotton', 'Butter Yellow / Pastel Blue', 999, 1499,
     'a0000000-0000-0000-0000-000000000004', ARRAY['BESTSELLER'], ARRAY['M','L','XL','XXL'],
     '[{"name":"Butter Yellow","hex":"#F5E6A8"},{"name":"Pastel Blue","hex":"#A8D4E6"}]'::jsonb, true),
    ('b0000000-0000-0000-0000-000000000002', 'High-Waist Denim Slit Skirt', 'high-waist-denim-slit-skirt',
     'Classic high-waist denim with front slit. Versatile day-to-night piece.',
     'Stretch Denim', 'Indigo Blue', 499, 799,
     'a0000000-0000-0000-0000-000000000003', ARRAY['NEW ARRIVAL'], ARRAY['S','M','L','XL'], '[]'::jsonb, true),
    ('b0000000-0000-0000-0000-000000000003', 'Sage Paperbag Wide-Leg Trousers', 'sage-paperbag-trousers',
     'Relaxed paperbag waist trousers in sage green.',
     'Cotton Blend', 'Sage Green', 899, NULL,
     'a0000000-0000-0000-0000-000000000003', ARRAY['TRENDING'], ARRAY['S','M','L'], '[]'::jsonb, true),
    ('b0000000-0000-0000-0000-000000000004', 'Vintage Vine Tiered Skirt', 'vintage-vine-tiered-skirt',
     'Soft breathable cotton blend tiered skirt with vine embroidery.',
     'Cotton Blend', 'Ivory / Sage', 649, NULL,
     'a0000000-0000-0000-0000-000000000001', '{}', ARRAY['S','M','L'], '[]'::jsonb, true),
    ('b0000000-0000-0000-0000-000000000005', 'Minimalist Cross-Stitch Knit', 'minimalist-cross-stitch-knit',
     'Cozy knit with delicate cross-stitch detail.',
     'Soft Acrylic Blend', 'Cream', 799, NULL,
     'a0000000-0000-0000-0000-000000000002', '{}', ARRAY['S','M','L','XL'], '[]'::jsonb, true)
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order, is_primary) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1595777457583-95e059fdfcdc?w=600', 0, true),
    ('b0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600', 0, true),
    ('b0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600', 0, true),
    ('b0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600', 0, true),
    ('b0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600', 0, true);

INSERT INTO product_variants (product_id, color_name, color_hex, size, stock_quantity) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Pastel Blue', '#A8D4E6', 'L', 1),
    ('b0000000-0000-0000-0000-000000000001', 'Butter Yellow', '#F5E6A8', 'M', 12),
    ('b0000000-0000-0000-0000-000000000002', NULL, NULL, 'M', 1),
    ('b0000000-0000-0000-0000-000000000003', NULL, NULL, 'L', 40),
    ('b0000000-0000-0000-0000-000000000004', NULL, NULL, 'M', 1),
    ('b0000000-0000-0000-0000-000000000005', NULL, NULL, 'L', 41);
