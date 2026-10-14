-- Запустите весь скрипт в Supabase → SQL Editor → New query.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "Покупатель видит свои push-подписки" on public.push_subscriptions;
create policy "Покупатель видит свои push-подписки"
on public.push_subscriptions for select to authenticated
using (auth.uid() = user_id);
drop policy if exists "Покупатель добавляет свою push-подписку" on public.push_subscriptions;
create policy "Покупатель добавляет свою push-подписку"
on public.push_subscriptions for insert to authenticated
with check (auth.uid() = user_id);
drop policy if exists "Покупатель обновляет свою push-подписку" on public.push_subscriptions;
create policy "Покупатель обновляет свою push-подписку"
on public.push_subscriptions for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Покупатель удаляет свою push-подписку" on public.push_subscriptions;
create policy "Покупатель удаляет свою push-подписку"
on public.push_subscriptions for delete to authenticated
using (auth.uid() = user_id);
create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);