alter table public.users enable row level security;

create policy "Users can create their own profile"
on public.users
for insert
with check (auth.uid() = id);

create policy "Users can view their own profile"
on public.users
for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins can view all users"
on public.users
for select
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  )
);
