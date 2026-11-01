begin;
revoke all on public.recipe_reference,public.recipe_favorites,public.recipe_history from anon,authenticated;
grant select on public.recipe_reference to authenticated;
grant select,insert,delete on public.recipe_favorites to authenticated;
grant select on public.recipe_history to authenticated;
grant update(portions,prepared_on,voided_at) on public.recipe_history to authenticated;
commit;
