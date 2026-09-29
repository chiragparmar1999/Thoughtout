create extension if not exists "pgcrypto";

create table if not exists audience_tickets (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null default 'tom-winter-2026',
  tier text not null check (tier in ('adult','couple','group4')),
  amount_inr integer not null,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  user_id uuid references auth.users(id), -- null for guest checkout; set when the buyer was logged in
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);

create table if not exists performer_registrations (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null default 'tom-winter-2026',
  name text not null,
  contact_no text not null,
  instagram_id text not null,
  email text not null,
  category text not null check (category in ('Poetry','Shayari','Storytelling','Stand-up Comedy','Singing','Rap / Hip-Hop','Acting','Mimicry','Others')),
  video_upsell boolean not null default false,
  video_extra_minutes smallint not null default 0 check (video_extra_minutes >= 0), -- minutes beyond the 6 included in the ₹354 package
  amount_inr integer not null,
  user_id uuid references auth.users(id),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);

create table if not exists creator_packages (
  id uuid primary key default gen_random_uuid(),
  package_name text not null default 'Ultimate Artist Portfolio Package',
  price_inr integer not null default 15000,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  instagram_id text,
  user_id uuid references auth.users(id),
  status text not null default 'enquiry' check (status in ('enquiry','pending_payment','paid','cancelled')),
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);

-- Writes happen server-side through app/api routes using the service role key (bypasses RLS).
-- RLS below only governs what a logged-in browser session may read directly for the dashboard.
alter table audience_tickets enable row level security;
alter table performer_registrations enable row level security;
alter table creator_packages enable row level security;

drop policy if exists "read own tickets" on audience_tickets;
create policy "read own tickets" on audience_tickets
  for select using (auth.uid() = user_id);

drop policy if exists "read own registrations" on performer_registrations;
create policy "read own registrations" on performer_registrations
  for select using (auth.uid() = user_id);

drop policy if exists "read own packages" on creator_packages;
create policy "read own packages" on creator_packages
  for select using (auth.uid() = user_id);
