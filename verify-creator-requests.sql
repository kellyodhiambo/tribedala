-- Check if creator_request columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name LIKE 'creator_%'
ORDER BY ordinal_position;

-- Show all users with creator_request = true
SELECT 
  id,
  full_name,
  email,
  role,
  creator_request,
  creator_request_category,
  creator_request_reason,
  creator_request_date,
  creator_approved,
  creator_approved_date
FROM public.users
WHERE creator_request = true
ORDER BY creator_request_date DESC;

-- Count creator requests by status
SELECT 
  creator_approved,
  COUNT(*) as count
FROM public.users
WHERE creator_request = true
GROUP BY creator_approved;
