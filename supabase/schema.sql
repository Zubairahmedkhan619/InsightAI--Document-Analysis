-- Supabase schema (placeholder).
--
-- Replace this file with the full schema SQL you were instructed to paste into:
-- Supabase Dashboard -> SQL Editor
--
-- Then enable Realtime on the `jobs` table:
-- Supabase Dashboard -> Database -> Replication -> jobs ✓

-- ==============================================
-- USERS (synced from Clerk webhook)
-- ==============================================
CREATE TABLE users (
  id TEXT PRIMARY KEY,          -- Clerk user_xxx ID
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise')),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- JOBS (replaces Analysis entity — all fields mapped)
-- ==============================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  input_type TEXT NOT NULL
    CHECK (input_type IN ('pdf','excel','ppt','image','youtube','video','word','url')),
  input_url TEXT,
  input_text TEXT,                        -- raw extracted text cache
  language_detected TEXT DEFAULT 'en',    -- detected input language
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed')),
  summary TEXT,
  key_findings JSONB,                     -- array of strings
  ai_insights TEXT,                       -- null for free analyses
  sentiment TEXT,
  word_count INTEGER,
  output_language TEXT DEFAULT 'en',
  is_paid_analysis BOOLEAN DEFAULT false,
  credits_used INTEGER DEFAULT 1,
  analysis_type TEXT DEFAULT 'summary',   -- summary|sentiment|statistical
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable Realtime for live progress in frontend
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;

-- ==============================================
-- USER CREDITS (replaces UserCredit entity)
-- ==============================================
CREATE TABLE user_credits (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  credits_remaining INT DEFAULT 2,         -- Free: 2/month
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise')),
  is_admin BOOLEAN DEFAULT false,
  subscription_expires DATE,               -- null for free users
  total_analyses INT DEFAULT 0,
  referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text),1,8),
  referred_at TIMESTAMPTZ
);

-- ==============================================
-- SUBSCRIPTIONS (managed by n8n Stripe handler)
-- ==============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ
);

-- ==============================================
-- AI AGENT STATUS (managed by n8n daily reset)
-- ==============================================
CREATE TABLE ai_agent_status (
  agent_name TEXT PRIMARY KEY,
  requests_used_today INT DEFAULT 0,
  daily_limit INT DEFAULT 14000,
  last_reset_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO ai_agent_status VALUES
  ('llama3-70b-8192', 0, 14000, NOW()),
  ('mixtral-8x7b-32768', 0, 14000, NOW()),
  ('gemma-7b-it', 0, 14000, NOW());

-- ==============================================
-- ROW LEVEL SECURITY
-- ==============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_self ON users USING (id = auth.uid()::TEXT);
CREATE POLICY jobs_own ON jobs USING (user_id = auth.uid()::TEXT);
CREATE POLICY credits_own ON user_credits USING (user_id = auth.uid()::TEXT);
CREATE POLICY subs_own ON subscriptions USING (user_id = auth.uid()::TEXT);

-- Allow public read for shared analyses:
CREATE POLICY jobs_public ON jobs FOR SELECT USING (true);