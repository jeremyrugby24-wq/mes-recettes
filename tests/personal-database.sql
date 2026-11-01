-- Execute in the SQL Editor. All test writes roll back; existing user data stays unchanged.
rollback;
begin;
do $$declare first_user uuid;second_user uuid;begin
 select id into first_user from auth.users order by created_at limit 1;
 second_user:=gen_random_uuid();
 if first_user is null then raise exception 'One existing account required';end if;
 perform set_config('request.jwt.claims',json_build_object('sub',first_user,'role','authenticated')::text,true);
 perform set_config('personal.test_user_b',second_user::text,true);
end$$;
set local role authenticated;
do $$declare history_id uuid; plan uuid; amount numeric; begin
 insert into public.recipe_favorites(user_id,recipe_id) values(auth.uid(),'R01') on conflict do nothing;
 history_id:=public.record_prepared_recipe('N01',4,date '2024-02-29');
 perform set_config('personal.test_history',history_id::text,true);
 select (nutrition->>'protein_g')::numeric*portions into amount from public.recipe_history where id=history_id;
 if amount<>202 then raise exception 'Snapshot or portions incorrect: %',amount; end if;
 insert into public.user_recipes(user_id,recipe_id,portions,completed_at) values(auth.uid(),'N02',4,null) on conflict(user_id,recipe_id) do update set portions=4,completed_at=null returning id into plan;
 perform public.set_recipe_prepared(plan,true);
 if not exists(select 1 from public.recipe_history where plan_id=plan and voided_at is null and portions=4) then raise exception 'Completion not archived'; end if;
 perform public.set_recipe_prepared(plan,false);
 if exists(select 1 from public.recipe_history where plan_id=plan and completed_at=(select max(completed_at) from public.recipe_history where plan_id=plan) and voided_at is null) then raise exception 'Undo not archived'; end if;
 perform public.set_recipe_prepared(plan,true);
 if (select count(*) from public.recipe_history where plan_id=plan and voided_at is null)<1 then raise exception 'Repeat not retained'; end if;
 if has_column_privilege(current_user,'public.recipe_history','nutrition','UPDATE') then raise exception 'Snapshot must be immutable to clients'; end if;
end$$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('personal.test_user_b'),'role','authenticated')::text,true);
do $$declare affected integer; begin
 if exists(select 1 from public.recipe_favorites where user_id<>auth.uid()) then raise exception 'Cross-account favorites leak'; end if;
 if exists(select 1 from public.recipe_history where id=current_setting('personal.test_history')::uuid) then raise exception 'Cross-account history leak'; end if;
 update public.recipe_history set portions=1 where id=current_setting('personal.test_history')::uuid;get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Cross-account write allowed'; end if;
end$$;
reset role;
set local role anon;
do $$begin if has_table_privilege(current_user,'public.recipe_history','SELECT') or has_table_privilege(current_user,'public.recipe_favorites','SELECT') then raise exception 'Anonymous account access allowed'; end if;end$$;
reset role;
rollback;
select 'PASS: snapshots, portions, archive, undo, repeat and account isolation. Test writes rolled back.' as validation;
