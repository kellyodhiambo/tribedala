/**
 * Run a SQL file against Supabase using the Management API.
 * Usage: node run-sql.cjs <path-to-sql-file>
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY3d6cWp6YXJpaHVwbnBjam1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NjYxOSwiZXhwIjoyMTA0OTcyNjE5fQ.EGsV-1HQ5HZ1lEmovMiapdjmJjrPzUl-XdZtk00U0cU';
const PROJECT_REF  = 'jocwzqjzarihupnpcjmm';

const sqlFile = process.argv[2];
if (!sqlFile) { console.error('Usage: node run-sql.cjs <file.sql>'); process.exit(1); }

const sql = fs.readFileSync(path.resolve(sqlFile), 'utf8');
const body = JSON.stringify({ query: sql });

const opts = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${PROJECT_REF}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

let d = '';
const req = https.request(opts, r => {
  r.on('data', c => d += c);
  r.on('end', () => {
    console.log('HTTP', r.statusCode);
    try {
      const parsed = JSON.parse(d);
      if (Array.isArray(parsed)) {
        console.log('Rows returned:', parsed.length);
        if (parsed.length > 0) console.log(JSON.stringify(parsed.slice(0, 5), null, 2));
      } else {
        console.log(JSON.stringify(parsed, null, 2));
      }
    } catch { console.log(d); }
  });
});
req.on('error', e => console.error('Request error:', e.message));
req.write(body);
req.end();
