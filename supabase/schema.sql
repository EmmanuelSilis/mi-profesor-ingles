-- Private library. Apply to the dedicated mi-profesor-ingles project.
create table if not exists public.english_lessons (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null,
 course jsonb not null,
 primary key(user_id,id),
 check (course->>'id' = id)
);
create table if not exists public.english_attempts (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null,
 course_id text not null,
 attempt jsonb not null,
 primary key(user_id,id)
);
alter table public.english_lessons enable row level security;
alter table public.english_attempts enable row level security;
grant select, insert, update on public.english_lessons to authenticated;
grant select, insert on public.english_attempts to authenticated;
create policy "Own lessons read" on public.english_lessons for select to authenticated using (user_id = (select auth.uid()));
create policy "Own lessons add" on public.english_lessons for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Own lessons edit" on public.english_lessons for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Own attempts read" on public.english_attempts for select to authenticated using (user_id = (select auth.uid()));
create policy "Own attempts add" on public.english_attempts for insert to authenticated with check (user_id = (select auth.uid()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('english-originals','english-originals',false,41943040,array['application/pdf','image/jpeg','image/png']);
create policy "Own originals read" on storage.objects for select to authenticated using (bucket_id='english-originals' and (storage.foldername(name))[1]=(select auth.uid()::text));
create policy "Own originals add" on storage.objects for insert to authenticated with check (bucket_id='english-originals' and (storage.foldername(name))[1]=(select auth.uid()::text));
