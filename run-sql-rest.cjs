/**
 * Run DDL against Supabase by creating a SECURITY DEFINER function
 * and immediately calling it, then dropping it.
 * This works because the service role key can call any RPC.
 */
const https = require('https');

const ANON_KEY    = 'sb_publishable_hBrfRPAgiTPQozJJSihorg_4t7Dh_ne';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY3d6cWp6YXJpaHVwbnBjam1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NjYxOSwiZXhwIjoyMTA0OTcyNjE5fQ.EGsV-1HQ5HZ1lEmovMiapdjmJjrPzUl-XdZtk00U0cU';
const PROJECT     = 'jocwzqjzarihupnpcjmm';

function post(path, body, key) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: `${PROJECT}.supabase.co`,
      path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'apikey': key,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    let d = '';
    const req = https.request(opts, r => {
      r.on('data', c => d += c);
      r.on('end', () => resolve({ status: r.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  // Step 1: Create a one-time DDL helper function using service role
  const createFn = `
    CREATE OR REPLACE FUNCTION _run_ddl_once()
    RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
    BEGIN
      -- Make user_id, qr_code, payment_reference nullable
      ALTER TABLE tickets ALTER COLUMN user_id DROP NOT NULL;
      ALTER TABLE tickets ALTER COLUMN qr_code DROP NOT NULL;
      ALTER TABLE tickets ALTER COLUMN payment_reference DROP NOT NULL;

      -- Drop all existing policies on tickets
      DECLARE r RECORD;
      FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'tickets' AND schemaname = 'public'
      LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON tickets';
      END LOOP;

      -- Service role bypass
      CREATE POLICY "Service role full access on tickets"
        ON tickets FOR ALL TO service_role USING (true) WITH CHECK (true);

      -- Anonymous INSERT (guest checkout)
      CREATE POLICY "Anyone can purchase tickets"
        ON tickets FOR INSERT TO anon, authenticated WITH CHECK (true);

      -- Users can read/update their own
      CREATE POLICY "Users can read their own tickets"
        ON tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);

      CREATE POLICY "Users can update their own tickets"
        ON tickets FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

      CREATE POLICY "Anon can update guest tickets"
        ON tickets FOR UPDATE TO anon USING (user_id IS NULL);

      RETURN 'done';
    END; $$;
  `;

  console.log('Step 1: Creating DDL function...');
  const r1 = await post('/rest/v1/rpc/_run_ddl_once', {}, SERVICE_KEY);
  console.log('Initial call (expected 404):', r1.status);

  // Actually, let's use a simpler approach: just test the insert with service role
  // after trying each ALTER via the REST API trick
  console.log('\nTesting INSERT with service role...');
  const r2 = await post('/rest/v1/tickets', {
    event_id: '7b6ee853-a953-4c14-8e9f-b74e4be50133',
    tier_name: 'General Admission',
    ticket_name: 'General Admission',
    price: 500,
    quantity: 1,
    total_amount: 500,
    buyer_name: 'Test Buyer',
    buyer_email: 'buyer@test.com',
    buyer_phone: '0712345678',
    payment_status: 'pending',
    payment_method: 'mpesa',
    status: 'pending',
  }, SERVICE_KEY);
  console.log('Service role INSERT:', r2.status, r2.body.substring(0, 300));
}

main().catch(console.error);
