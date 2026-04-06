-- ============================================
-- AGENTS HOTEL — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  office_name TEXT NOT NULL DEFAULT 'Mi Oficina',
  coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, office_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'office_name', 'Mi Oficina')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Rooms
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'startup',
  is_public BOOLEAN NOT NULL DEFAULT true,
  visitors_count INTEGER NOT NULL DEFAULT 0,
  furniture JSONB NOT NULL DEFAULT '[]'::jsonb,
  map_data JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Each user gets one default room
CREATE UNIQUE INDEX idx_rooms_owner ON public.rooms(owner_id);

-- 3. Agents
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🤖',
  agent_class TEXT NOT NULL DEFAULT 'Rookie',
  color TEXT NOT NULL DEFAULT '#00ff88',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  xp_max INTEGER NOT NULL DEFAULT 1000,
  status TEXT NOT NULL DEFAULT 'idle',
  status_text TEXT NOT NULL DEFAULT 'Esperando instrucciones',
  configured BOOLEAN NOT NULL DEFAULT false,
  figure_code TEXT,
  appearance JSONB NOT NULL DEFAULT '{
    "skinColor": "#e8b88a",
    "hairColor": "#2a1a0a",
    "shirtColor": "#00aa66",
    "pantsColor": "#1a1a3a",
    "shoeColor": "#222222",
    "hairStyle": "short",
    "accessory": "none"
  }'::jsonb,
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  equipment JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_task JSONB NOT NULL DEFAULT '{"name": "Sin tarea", "detail": "—", "progress": 0}'::jsonb,
  desk_tile JSONB NOT NULL DEFAULT '{"x": 3, "y": 3}'::jsonb,
  total_earned INTEGER NOT NULL DEFAULT 0,
  work_ticks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Marketplace listings
CREATE TABLE public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  buyer_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Room visits (for tracking visitors)
CREATE TABLE public.room_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_visits ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only owner can update
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Rooms: public rooms viewable by all, owner can CRUD
CREATE POLICY "Public rooms are viewable" ON public.rooms
  FOR SELECT USING (is_public = true OR owner_id = auth.uid());
CREATE POLICY "Users can create own room" ON public.rooms
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own room" ON public.rooms
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own room" ON public.rooms
  FOR DELETE USING (owner_id = auth.uid());

-- Agents: viewable in public rooms, owner can CRUD
CREATE POLICY "Agents in public rooms are viewable" ON public.agents
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.rooms WHERE rooms.id = agents.room_id AND rooms.is_public = true)
  );
CREATE POLICY "Users can manage own agents" ON public.agents
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own agents" ON public.agents
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own agents" ON public.agents
  FOR DELETE USING (owner_id = auth.uid());

-- Marketplace: all active listings viewable, seller can manage
CREATE POLICY "Active listings are viewable" ON public.marketplace_listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid() OR buyer_id = auth.uid());
CREATE POLICY "Users can create listings" ON public.marketplace_listings
  FOR INSERT WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Sellers can update listings" ON public.marketplace_listings
  FOR UPDATE USING (seller_id = auth.uid());

-- Room visits: anyone authenticated can create, viewable by room owner
CREATE POLICY "Users can log visits" ON public.room_visits
  FOR INSERT WITH CHECK (visitor_id = auth.uid());
CREATE POLICY "Room owners can see visits" ON public.room_visits
  FOR SELECT USING (
    visitor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.rooms WHERE rooms.id = room_visits.room_id AND rooms.owner_id = auth.uid())
  );
