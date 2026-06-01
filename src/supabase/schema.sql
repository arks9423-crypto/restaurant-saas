-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ========================================
-- RESTAURANTS TABLE
-- ========================================
create table public.restaurants (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references auth.users(id) on delete cascade not null,
  name_ar text not null,
  name_en text not null,
  slug text unique not null,
  logo_url text,
  theme_color text default '#f97316',
  phone text,
  subscription_status text default 'trial' check (subscription_status in ('active','expired','trial')),
  subscription_end timestamptz,
  created_at timestamptz default now()
);

alter table public.restaurants enable row level security;

create policy "owners can manage their restaurant"
  on public.restaurants for all
  using (auth.uid() = owner_id);

create policy "anyone can read restaurant by slug"
  on public.restaurants for select
  using (true);

-- ========================================
-- MENU CATEGORIES
-- ========================================
create table public.menu_categories (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name_ar text not null,
  name_en text not null,
  sort_order integer default 0,
  is_active boolean default true
);

alter table public.menu_categories enable row level security;

create policy "owner manages categories"
  on public.menu_categories for all
  using (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = auth.uid()));

create policy "anyone reads active categories"
  on public.menu_categories for select
  using (is_active = true);

-- ========================================
-- MENU ITEMS
-- ========================================
create table public.menu_items (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.menu_categories(id) on delete cascade not null,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  price numeric(10,3) not null,
  image_url text,
  is_available boolean default true
);

alter table public.menu_items enable row level security;

create policy "owner manages items"
  on public.menu_items for all
  using (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = auth.uid()));

create policy "anyone reads available items"
  on public.menu_items for select
  using (is_available = true);

-- ========================================
-- ORDERS
-- ========================================
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  car_plate text not null,
  customer_phone text,
  status text default 'pending' check (status in ('pending','preparing','ready','delivered')),
  total_amount numeric(10,3) not null,
  notes text,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "owner reads all orders"
  on public.orders for select
  using (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = auth.uid()));

create policy "owner updates order status"
  on public.orders for update
  using (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = auth.uid()));

create policy "anyone can insert order"
  on public.orders for insert
  with check (true);

create policy "customer reads own order"
  on public.orders for select
  using (true);

-- ========================================
-- ORDER ITEMS
-- ========================================
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  menu_item_id uuid references public.menu_items(id) not null,
  item_name text not null,
  quantity integer not null,
  unit_price numeric(10,3) not null
);

alter table public.order_items enable row level security;

create policy "anyone can insert order items"
  on public.order_items for insert
  with check (true);

create policy "anyone can read order items"
  on public.order_items for select
  using (true);

-- ========================================
-- ENABLE REALTIME
-- ========================================
alter publication supabase_realtime add table public.orders;

-- ========================================
-- STORAGE BUCKET
-- ========================================
insert into storage.buckets (id, name, public) values ('restaurant-assets', 'restaurant-assets', true);

create policy "anyone reads assets"
  on storage.objects for select
  using (bucket_id = 'restaurant-assets');

create policy "owners upload assets"
  on storage.objects for insert
  with check (bucket_id = 'restaurant-assets' and auth.role() = 'authenticated');

create policy "owners delete their assets"
  on storage.objects for delete
  using (bucket_id = 'restaurant-assets' and auth.uid()::text = (storage.foldername(name))[1]);
