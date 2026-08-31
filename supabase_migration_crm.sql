-- ============================================================
-- FluxOne CRM Migration Script
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- 1. UPDATE LEADS TABLE - Add CRM columns for pipeline tracking
-- ============================================================

-- Add new columns to leads table for CRM pipeline functionality
ALTER TABLE leads ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_confidence INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT 'manual';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_value NUMERIC DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Update existing leads with 'Lead' status to 'new' for pipeline consistency
UPDATE leads SET status = 'new' WHERE status = 'Lead' OR status IS NULL;
UPDATE leads SET status = 'new' WHERE status = 'No email found';

-- Add constraint for valid pipeline statuses
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
  -- Add new constraint with CRM pipeline statuses
  ALTER TABLE leads ADD CONSTRAINT leads_status_check 
    CHECK (status IN ('new', 'contacted', 'interested', 'won', 'lost'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add status constraint: %', SQLERRM;
END $$;

-- ============================================================
-- 2. CREATE MESSAGES TABLE - Track emails sent to leads
-- ============================================================

CREATE TABLE IF NOT EXISTS lead_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  account_id UUID NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_id TEXT DEFAULT 'custom',
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'replied', 'failed')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_lead_messages_lead_id ON lead_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_messages_account_id ON lead_messages(account_id);
CREATE INDEX IF NOT EXISTS idx_lead_messages_sent_at ON lead_messages(sent_at DESC);

-- ============================================================
-- 3. CREATE EMAIL_TEMPLATES TABLE - Store custom email templates
-- ============================================================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_type TEXT DEFAULT 'custom' CHECK (template_type IN ('intro', 'followup', 'offer', 'custom')),
  is_active BOOLEAN DEFAULT true,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default templates
INSERT INTO email_templates (account_id, name, subject, body, template_type)
SELECT 
  a.id,
  'Cold Introduction',
  'Helping {businessName} grow with professional services',
  'Hi {businessName} team,

I hope this message finds you well. My name is {senderName} and I help businesses like yours streamline operations and increase revenue.

I came across your business and was impressed by what you'' doing. I'' love to learn more about your current needs and see if there'' a way we can work together.

Would you be open to a quick 15-minute call this week?

Best regards,
{senderName}',
  'intro'
FROM accounts a
WHERE NOT EXISTS (
  SELECT 1 FROM email_templates et 
  WHERE et.account_id = a.id AND et.template_type = 'intro'
);

INSERT INTO email_templates (account_id, name, subject, body, template_type)
SELECT 
  a.id,
  'Follow Up',
  'Following up - {businessName}',
  'Hi {businessName} team,

I reached out recently about helping your business grow. I know you'' busy, so I'' keep this brief.

I'' love to schedule a quick call to discuss how we can help. Are you available sometime this week?

Best regards,
{senderName}',
  'followup'
FROM accounts a
WHERE NOT EXISTS (
  SELECT 1 FROM email_templates et 
  WHERE et.account_id = a.id AND et.template_type = 'followup'
);

INSERT INTO email_templates (account_id, name, subject, body, template_type)
SELECT 
  a.id,
  'Special Offer',
  'Exclusive offer for {businessName}',
  'Hi {businessName} team,

I'' reaching out with a special offer that I think could really benefit your business.

For a limited time, we''e offering new clients a complimentary consultation plus 20% off your first month of service.

Would you like to learn more? I'' happy to schedule a call at your convenience.

Best regards,
{senderName}',
  'offer'
FROM accounts a
WHERE NOT EXISTS (
  SELECT 1 FROM email_templates et 
  WHERE et.account_id = a.id AND et.template_type = 'offer'
);

-- ============================================================
-- 4. CREATE LEAD_CAMPAIGNS TABLE - Track bulk outreach campaigns
-- ============================================================

CREATE TABLE IF NOT EXISTS lead_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  search_queries TEXT[],
  template_id UUID REFERENCES email_templates(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  total_leads INTEGER DEFAULT 0,
  contacted_leads INTEGER DEFAULT 0,
  responded_leads INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_campaigns_account_id ON lead_campaigns(account_id);

-- ============================================================
-- 5. CREATE LEAD_ACTIVITIES TABLE - Track all lead interactions
-- ============================================================

CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  account_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'created', 'status_changed', 'email_sent', 'email_opened', 
    'email_replied', 'called', 'meeting_scheduled', 'note_added',
    'enriched', 'exported'
  )),
  description TEXT,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_account_id ON lead_activities(account_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at DESC);

-- ============================================================
-- 6. ENABLE RLS POLICIES FOR NEW TABLES
-- ============================================================

-- Lead Messages RLS
ALTER TABLE lead_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lead messages"
  ON lead_messages FOR SELECT
  USING (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own lead messages"
  ON lead_messages FOR INSERT
  WITH CHECK (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own lead messages"
  ON lead_messages FOR UPDATE
  USING (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own lead messages"
  ON lead_messages FOR DELETE
  USING (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

-- Email Templates RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email templates"
  ON email_templates FOR SELECT
  USING (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own email templates"
  ON email_templates FOR INSERT
  WITH CHECK (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own email templates"
  ON email_templates FOR UPDATE
  USING (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own email templates"
  ON email_templates FOR DELETE
  USING (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

-- Lead Campaigns RLS
ALTER TABLE lead_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own campaigns"
  ON lead_campaigns FOR SELECT
  USING (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own campaigns"
  ON lead_campaigns FOR INSERT
  WITH CHECK (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own campaigns"
  ON lead_campaigns FOR UPDATE
  USING (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own campaigns"
  ON lead_campaigns FOR DELETE
  USING (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

-- Lead Activities RLS
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lead activities"
  ON lead_activities FOR SELECT
  USING (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own lead activities"
  ON lead_activities FOR INSERT
  WITH CHECK (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own lead activities"
  ON lead_activities FOR UPDATE
  USING (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own lead activities"
  ON lead_activities FOR DELETE
  USING (account_id = auth.uid() OR account_id IN (
    SELECT account_id FROM users WHERE user_id = auth.uid()
  ));

-- ============================================================
-- 7. CREATE TRIGGERS FOR updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_lead_messages_updated_at ON lead_messages;
CREATE TRIGGER update_lead_messages_updated_at
  BEFORE UPDATE ON lead_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lead_campaigns_updated_at ON lead_campaigns;
CREATE TRIGGER update_lead_campaigns_updated_at
  BEFORE UPDATE ON lead_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 8. CREATE TRIGGER TO LOG LEAD STATUS CHANGES
-- ============================================================

CREATE OR REPLACE FUNCTION log_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO lead_activities (lead_id, account_id, activity_type, description, old_value, new_value)
    VALUES (NEW.id, NEW.account_id, 'status_changed', 
      'Lead status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status,
      OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_lead_status_change ON leads;
CREATE TRIGGER trigger_log_lead_status_change
  AFTER UPDATE ON leads
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION log_lead_status_change();

-- ============================================================
-- 9. CREATE TRIGGER TO LOG NEW LEADS
-- ============================================================

CREATE OR REPLACE FUNCTION log_new_lead()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO lead_activities (lead_id, account_id, activity_type, description)
  VALUES (NEW.id, NEW.account_id, 'created', 'Lead created: ' || COALESCE(NEW.business_name, 'Unknown'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_new_lead ON leads;
CREATE TRIGGER trigger_log_new_lead
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION log_new_lead();

-- ============================================================
-- 10. UPDATE LEADS RLS POLICIES (ensure pipeline statuses work)
-- ============================================================

-- Make sure leads table has RLS enabled
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- If you had RLS issues before, you can either:
-- Option A: Disable RLS temporarily (for development)
-- ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Option B: Add permissive policy for authenticated users
DO $$
BEGIN
  -- Check if a permissive policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leads' AND policyname = 'Users can manage their own leads'
  ) THEN
    CREATE POLICY "Users can manage their own leads"
      ON leads FOR ALL
      USING (account_id = auth.uid() OR account_id IN (
        SELECT account_id FROM users WHERE user_id = auth.uid()
      ))
      WITH CHECK (account_id = auth.uid() OR account_id IN (
        SELECT account_id FROM users WHERE user_id = auth.uid()
      ));
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add leads policy: %', SQLERRM;
END $$;

-- ============================================================
-- DONE! 
-- ============================================================
-- After running this script:
-- 1. Your leads table has new CRM columns (category, website, rating, etc.)
-- 2. New tables: lead_messages, email_templates, lead_campaigns, lead_activities
-- 3. RLS policies are set up for all new tables
-- 4. Triggers auto-log status changes and new leads
-- 5. Default email templates are inserted for existing accounts
--
-- To verify, run: SELECT * FROM lead_activities LIMIT 5;
-- ============================================================
