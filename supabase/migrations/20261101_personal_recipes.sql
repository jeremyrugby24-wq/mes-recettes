begin;
create table if not exists public.recipe_reference (
 recipe_id text primary key, title text not null, nutrition jsonb not null
);
alter table public.recipe_reference enable row level security;
create policy "Recipe reference readable" on public.recipe_reference for select to authenticated using (true);
grant select on public.recipe_reference to authenticated;
create table public.recipe_favorites (
 user_id uuid not null references auth.users(id) on delete cascade,
 recipe_id text not null references public.recipe_reference(recipe_id),
 created_at timestamptz not null default now(), primary key(user_id,recipe_id)
);
alter table public.recipe_favorites enable row level security;
create policy "Own favorites" on public.recipe_favorites for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
grant select,insert,delete on public.recipe_favorites to authenticated;
create table public.recipe_history (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 recipe_id text not null, title text not null, nutrition jsonb not null,
 portions integer not null check(portions between 1 and 100), prepared_on date not null,
 completed_at timestamptz not null default now(), plan_id uuid, voided_at timestamptz,
 unique(plan_id,completed_at)
);
alter table public.recipe_history enable row level security;
create policy "Own history read" on public.recipe_history for select to authenticated using(user_id=auth.uid());
create policy "Own history edit" on public.recipe_history for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select on public.recipe_history to authenticated;
grant update(portions,prepared_on,voided_at) on public.recipe_history to authenticated;
create index recipe_history_user_date on public.recipe_history(user_id,prepared_on desc);
create function public.capture_prepared_recipe() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if new.completed_at is not null and (tg_op='INSERT' or old.completed_at is distinct from new.completed_at) then
  insert into public.recipe_history(user_id,recipe_id,title,nutrition,portions,prepared_on,completed_at,plan_id)
  select new.user_id,new.recipe_id,r.title,r.nutrition,new.portions,(new.completed_at at time zone 'Europe/Paris')::date,new.completed_at,new.id from public.recipe_reference r where r.recipe_id=new.recipe_id
  on conflict(plan_id,completed_at) do nothing;
 end if;
 return new;
end $$;
create trigger capture_prepared_recipe after insert or update of completed_at on public.user_recipes for each row execute function public.capture_prepared_recipe();
create function public.set_recipe_prepared(p_plan_id uuid,p_done boolean) returns void language plpgsql security invoker set search_path=public,pg_temp as $$
declare item public.user_recipes;
begin
 select * into item from public.user_recipes where id=p_plan_id and user_id=auth.uid() for update;
 if not found then raise exception 'Recipe not found'; end if;
 if p_done and item.completed_at is null then
  update public.user_recipes set completed_at=clock_timestamp() where id=item.id and user_id=auth.uid();
 elsif not p_done and item.completed_at is not null then
  update public.recipe_history set voided_at=now() where plan_id=item.id and completed_at=item.completed_at and user_id=auth.uid();
  update public.user_recipes set completed_at=null where id=item.id and user_id=auth.uid();
 end if;
end $$;
create function public.record_prepared_recipe(p_recipe_id text,p_portions integer,p_prepared_on date) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare result uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_prepared_on>current_date+1 or p_prepared_on<date '2000-01-01' then raise exception 'Invalid date'; end if;
 insert into public.recipe_history(user_id,recipe_id,title,nutrition,portions,prepared_on)
 select auth.uid(),recipe_id,title,nutrition,p_portions,p_prepared_on from public.recipe_reference where recipe_id=p_recipe_id returning id into result;
 if result is null then raise exception 'Recipe not found'; end if;
 return result;
end $$;
revoke all on function public.capture_prepared_recipe() from public,anon,authenticated;
revoke all on function public.set_recipe_prepared(uuid,boolean) from public,anon;
revoke all on function public.record_prepared_recipe(text,integer,date) from public,anon;
grant execute on function public.set_recipe_prepared(uuid,boolean) to authenticated;
grant execute on function public.record_prepared_recipe(text,integer,date) to authenticated;

insert into public.recipe_reference(recipe_id,title,nutrition) values
('R01','Poulet façon Buffalo & pommes de terre — sauce maison','{"kcal": 466, "kcal_components_sum": 466, "protein_g": 42.6, "carbs_g": 42.3, "fat_g": 11.9}'::jsonb),
('R02','Poêlée méditerranéenne au poulet','{"kcal": 491, "kcal_components_sum": 491, "protein_g": 47.2, "carbs_g": 46.8, "fat_g": 10.6}'::jsonb),
('R03','Poulet curry rouge thaï','{"kcal": 565, "kcal_components_sum": 565, "protein_g": 45.8, "carbs_g": 59.5, "fat_g": 12.4}'::jsonb),
('R04','Paëlla au poulet','{"kcal": 573, "kcal_components_sum": 573, "protein_g": 46.1, "carbs_g": 70.7, "fat_g": 8.6}'::jsonb),
('R05','Bowl thaï au poulet','{"kcal": 481, "kcal_components_sum": 481, "protein_g": 46.7, "carbs_g": 49.7, "fat_g": 7.5}'::jsonb),
('R06','Pâtes protéinées à la bolognaise','{"kcal": 562, "kcal_components_sum": 562, "protein_g": 51, "carbs_g": 52.1, "fat_g": 14.9}'::jsonb),
('R07','Saumon & pâtes protéinées à la crème citronnée','{"kcal": 551, "kcal_components_sum": 551, "protein_g": 38.6, "carbs_g": 37, "fat_g": 26.7}'::jsonb),
('R08','Lasagnes légères au bœuf et mozzarella','{"kcal": 521, "kcal_components_sum": 521, "protein_g": 39.1, "carbs_g": 51.9, "fat_g": 15.3}'::jsonb),
('R09','Poulet coco, chili & citronnelle','{"kcal": 551, "kcal_components_sum": 551, "protein_g": 46, "carbs_g": 53.3, "fat_g": 14.1}'::jsonb),
('R10','Émincé de bœuf aux légumes & riz complet','{"kcal": 539, "kcal_components_sum": 539, "protein_g": 45.1, "carbs_g": 54.4, "fat_g": 13.2}'::jsonb),
('R11','Poulet gratiné à la mozzarella','{"kcal": 524, "kcal_components_sum": 524, "protein_g": 52.4, "carbs_g": 45.1, "fat_g": 11.5}'::jsonb),
('R12','Poulet aux légumes & fromage fondant','{"kcal": 491, "kcal_components_sum": 491, "protein_g": 48.1, "carbs_g": 45.4, "fat_g": 10.5}'::jsonb),
('R13','Couscous rouge au poulet & courgettes','{"kcal": 504, "kcal_components_sum": 504, "protein_g": 50.5, "carbs_g": 52.8, "fat_g": 7.2}'::jsonb),
('R14','Bowl poulet & patate douce','{"kcal": 419, "kcal_components_sum": 419, "protein_g": 44.1, "carbs_g": 38.1, "fat_g": 7.9}'::jsonb),
('R15','Poulet haché épicé à l''indienne','{"kcal": 520, "kcal_components_sum": 520, "protein_g": 48.8, "carbs_g": 60.4, "fat_g": 6.4}'::jsonb),
('R16','Poulet au chou rouge & spätzle','{"kcal": 496, "kcal_components_sum": 496, "protein_g": 47.3, "carbs_g": 42.2, "fat_g": 12}'::jsonb),
('R17','Spätzle à l''émincé de bœuf & champignons','{"kcal": 547, "kcal_components_sum": 547, "protein_g": 45.3, "carbs_g": 38.1, "fat_g": 21.3}'::jsonb),
('R18','Cheeseburger bowl — sauce burger maison','{"kcal": 488, "kcal_components_sum": 488, "protein_g": 45.3, "carbs_g": 36.5, "fat_g": 17.3}'::jsonb),
('R19','Thai Panang au poulet','{"kcal": 532, "kcal_components_sum": 532, "protein_g": 46.2, "carbs_g": 55, "fat_g": 10.5}'::jsonb),
('R20','Penne protéinées à la bolognaise','{"kcal": 468, "kcal_components_sum": 468, "protein_g": 43, "carbs_g": 45.8, "fat_g": 11.2}'::jsonb),
('R21','Fusilli protéinés crémeux à la citronnelle (végétarien)','{"kcal": 548, "kcal_components_sum": 548, "protein_g": 35.2, "carbs_g": 47.7, "fat_g": 23.8}'::jsonb),
('R22','Poulet à la crème de champignons','{"kcal": 515, "kcal_components_sum": 515, "protein_g": 48.8, "carbs_g": 45.6, "fat_g": 12.6}'::jsonb),
('R23','Poulet croustillant coco & riz — sauce aigre-douce maison','{"kcal": 500, "kcal_components_sum": 500, "protein_g": 47.2, "carbs_g": 41.5, "fat_g": 14.4}'::jsonb),
('R24','Chili con carne léger','{"kcal": 569, "kcal_components_sum": 569, "protein_g": 41.8, "carbs_g": 71.5, "fat_g": 10.9}'::jsonb),
('ajout-dinde-curry-riz','Émincé de dinde au curry crémeux & riz basmati','{"kcal": 455, "protein_g": 43.2, "carbs_g": 46.5, "fat_g": 9.4}'::jsonb),
('ajout-wok-boeuf-nouilles','Wok de bœuf haché 5 % aux nouilles sautées & légumes croquants','{"kcal": 470, "protein_g": 42, "carbs_g": 48, "fat_g": 10.5}'::jsonb),
('ajout-poulet-galette-pdt','Poulet rôti aux herbes & galette de pommes de terre croustillante','{"kcal": 475, "protein_g": 43.5, "carbs_g": 43, "fat_g": 10.5}'::jsonb),
('ajout-cabillaud-croute-herbes','Pavé de cabillaud en croûte d’herbes & écrasé de pommes de terre','{"kcal": 440, "protein_g": 41.5, "carbs_g": 40, "fat_g": 11}'::jsonb),
('ajout-crevettes-semoule','Poêlée de crevettes à l’ail, tomates cerises & semoule parfumée','{"kcal": 430, "protein_g": 42, "carbs_g": 46, "fat_g": 9.2}'::jsonb),
('ajout-burger-bowl-montagnard','Burger bowl montagnard au bœuf 5 %','{"kcal": 485, "protein_g": 43.5, "carbs_g": 42, "fat_g": 12.8}'::jsonb),
('ajout-poulet-pesto-rouge-pates','Émincé de poulet au pesto rouge, tomates séchées & spaghettis complets','{"kcal": 475, "protein_g": 43, "carbs_g": 44, "fat_g": 12}'::jsonb),
('ajout-dinde-poireaux-chevre','Poêlée de dinde aux poireaux & fondue de chèvre frais','{"kcal": 445, "protein_g": 43.8, "carbs_g": 36.5, "fat_g": 11.5}'::jsonb),
('ajout-boeuf-poivrons-quinoa','Steak haché 5 % aux poivrons marinés & quinoa aux épices','{"kcal": 460, "protein_g": 41.8, "carbs_g": 43.5, "fat_g": 11.2}'::jsonb),
('ajout-poulet-champignons-polenta','Blanc de poulet au thym, fondue de champignons & polenta crémeuse','{"kcal": 470, "protein_g": 44, "carbs_g": 45, "fat_g": 10}'::jsonb),
('N01','Poulet citron et quinoa aux courgettes','{"kcal": 443, "protein_g": 50.5, "carbs_g": 33.6, "fat_g": 10.2}'::jsonb),
('N02','Poulet tikka léger aux épinards et riz','{"kcal": 495, "protein_g": 56.8, "carbs_g": 45.1, "fat_g": 7}'::jsonb),
('N03','Poulet laqué soja-miel, brocoli et riz','{"kcal": 473, "protein_g": 51.3, "carbs_g": 46.7, "fat_g": 7.3}'::jsonb),
('N04','Dinde au paprika, penne et courgettes','{"kcal": 456, "protein_g": 49.8, "carbs_g": 39.5, "fat_g": 9.6}'::jsonb),
('N05','Boulettes de dinde à la tomate et semoule','{"kcal": 475, "protein_g": 48.7, "carbs_g": 47.7, "fat_g": 8.9}'::jsonb),
('N06','Dinde à la moutarde, carottes et pommes de terre','{"kcal": 484, "protein_g": 53.8, "carbs_g": 44.4, "fat_g": 9.3}'::jsonb),
('N07','Keftas de bœuf, semoule et sauce au skyr','{"kcal": 491, "protein_g": 52.1, "carbs_g": 35.9, "fat_g": 13.7}'::jsonb),
('N08','Gratin léger de bœuf et aubergine','{"kcal": 493, "protein_g": 52.5, "carbs_g": 30.9, "fat_g": 14.8}'::jsonb),
('N09','Filet mignon à la moutarde, pomme et quinoa','{"kcal": 489, "protein_g": 51.2, "carbs_g": 38.6, "fat_g": 13.8}'::jsonb),
('N10','Filet mignon balsamique, polenta et carottes','{"kcal": 487, "protein_g": 51, "carbs_g": 41.9, "fat_g": 11.5}'::jsonb),
('N11','Cabillaud tomate-olives et semoule','{"kcal": 492, "protein_g": 52.8, "carbs_g": 43.6, "fat_g": 9.5}'::jsonb),
('N12','Papillote de cabillaud citron-poireaux et quinoa','{"kcal": 490, "protein_g": 57, "carbs_g": 38, "fat_g": 9.9}'::jsonb),
('N13','Saumon sur lentilles et épinards, sauce citron','{"kcal": 494, "protein_g": 46.4, "carbs_g": 27.6, "fat_g": 18}'::jsonb),
('N14','Fusilli aux crevettes, paprika et courgettes','{"kcal": 452, "protein_g": 54, "carbs_g": 38.7, "fat_g": 7.4}'::jsonb),
('N15','Crevettes gingembre-sésame, brocoli et riz','{"kcal": 466, "protein_g": 54.2, "carbs_g": 45.2, "fat_g": 6.4}'::jsonb),
('N16','Salade de thon et pois chiches, sauce citronnée','{"kcal": 475, "protein_g": 57.4, "carbs_g": 35, "fat_g": 9}'::jsonb),
('N17','Gratin de thon, tomate et pommes de terre','{"kcal": 492, "protein_g": 57.9, "carbs_g": 42.3, "fat_g": 8.4}'::jsonb),
('N18','Penne au thon, citron et petits pois','{"kcal": 487, "protein_g": 58.1, "carbs_g": 43.1, "fat_g": 6.7}'::jsonb),
('N19','Tofu laqué, quinoa et sauce fraîche au skyr','{"kcal": 495, "protein_g": 45.2, "carbs_g": 30, "fat_g": 19.2}'::jsonb),
('N20','Frittata épinards-parmesan, pommes de terre et skyr','{"kcal": 475, "protein_g": 44.3, "carbs_g": 31.3, "fat_g": 17}'::jsonb)
on conflict(recipe_id) do update set title=excluded.title,nutrition=excluded.nutrition;

-- Preserve the recorded completions still present in the old planning table.
insert into public.recipe_history(user_id,recipe_id,title,nutrition,portions,prepared_on,completed_at,plan_id)
select p.user_id,p.recipe_id,r.title,r.nutrition,p.portions,(p.completed_at at time zone 'Europe/Paris')::date,p.completed_at,p.id
from public.user_recipes p join public.recipe_reference r using(recipe_id) where p.completed_at is not null
on conflict(plan_id,completed_at) do nothing;
commit;
