const https = require('https');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY3d6cWp6YXJpaHVwbnBjam1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NjYxOSwiZXhwIjoyMTA0OTcyNjE5fQ.EGsV-1HQ5HZ1lEmovMiapdjmJjrPzUl-XdZtk00U0cU';
const proj = 'jocwzqjzarihupnpcjmm';

// Try inserting with service role to confirm the table itself works
const body = JSON.stringify({
  event_id: '7b6ee853-a953-4c14-8e9f-b74e4be50133',
  user_id: null,
  tier_name: 'General Admission',
  ticket_name: 'General Admission',
  price: 500,
  quantity: 1,
  total_amount: 500,
  buyer_name: 'Test User',
  buyer_email: 'test@test.com',
  buyer_phone: '0712345678',
  payment_status: 'pending',
  payment_method: 'mpesa',
  status: 'pending'
});

const opts = {
  hostname: proj + '.supabase.co',
  path: '/rest/v1/tickets',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + key,
    'apikey': key,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
};

let d = '';
const req = https.request(opts, r => {
  r.on('data', c => d += c);
  r.on('end', () => console.log('SERVICE ROLE INSERT status:', r.statusCode, '\n', d));
});
req.on('error', e => console.error(e));
req.write(body);
req.end();
