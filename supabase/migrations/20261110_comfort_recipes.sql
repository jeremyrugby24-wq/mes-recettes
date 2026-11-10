begin;
insert into public.recipe_reference (recipe_id, title, nutrition) values
('N21', 'Spaghetti façon carbonara et courgettes', '{"kcal": 491, "protein_g": 42.0, "carbs_g": 46.6, "fat_g": 14.7}'::jsonb),
('N22', 'Gratin dauphinois, poulet et haricots verts', '{"kcal": 488, "protein_g": 47.2, "carbs_g": 58.0, "fat_g": 5.8}'::jsonb),
('N23', 'Gratin dauphinois au jambon et haricots verts', '{"kcal": 487, "protein_g": 47.8, "carbs_g": 58.9, "fat_g": 6.2}'::jsonb),
('N24', 'Tartiflette au reblochon, poulet et bacon', '{"kcal": 491, "protein_g": 48.0, "carbs_g": 40.7, "fat_g": 14.2}'::jsonb),
('N25', 'Fajitas au poulet, tomate et avocat', '{"kcal": 497, "protein_g": 43.9, "carbs_g": 52.4, "fat_g": 9.9}'::jsonb),
('N26', 'Fajitas au bœuf, tomate et avocat', '{"kcal": 498, "protein_g": 41.9, "carbs_g": 46.0, "fat_g": 14.1}'::jsonb),
('N27', 'Raviolis au bœuf, sauce façon bolognaise', '{"kcal": 495, "protein_g": 41.1, "carbs_g": 42.4, "fat_g": 16.2}'::jsonb),
('N28', 'Cheeseburger et frites au four', '{"kcal": 488, "protein_g": 41.9, "carbs_g": 45.7, "fat_g": 14.1}'::jsonb),
('N29', 'Pot-au-feu de bœuf', '{"kcal": 496, "protein_g": 46.5, "carbs_g": 45.2, "fat_g": 13.5}'::jsonb),
('N30', 'Bœuf bourguignon et pommes vapeur', '{"kcal": 494, "protein_g": 46.9, "carbs_g": 36.5, "fat_g": 14.2}'::jsonb),
('N31', 'Gnocchis au poulet, sauce crémeuse aux champignons', '{"kcal": 497, "protein_g": 46.1, "carbs_g": 48.5, "fat_g": 11.0}'::jsonb),
('N32', 'Pomme de terre au four, steak et sauce ciboulette', '{"kcal": 488, "protein_g": 48.8, "carbs_g": 52.2, "fat_g": 7.9}'::jsonb),
('N33', 'Pizza fine au poulet, mozzarella et légumes', '{"kcal": 492, "protein_g": 42.1, "carbs_g": 55.0, "fat_g": 9.1}'::jsonb),
('N34', 'Quiche froide bacon-poireaux et salade de poulet', '{"kcal": 490, "protein_g": 49.7, "carbs_g": 27.5, "fat_g": 18.1}'::jsonb)
on conflict (recipe_id) do update set title = excluded.title, nutrition = excluded.nutrition;
commit;
