-- Check for delivery partners without a linked user
SELECT
  dp.id AS delivery_partner_id,
  dp.name AS delivery_partner_name,
  dp.email AS delivery_partner_email
FROM
  delivery_partners dp
LEFT JOIN
  auth.users u ON dp.user_id = u.id
WHERE
  u.id IS NULL;

-- Check for profiles with role 'delivery_partner' but no corresponding delivery_partners record
SELECT
  p.id AS profile_id,
  p.business_name AS profile_name,
  p.email AS profile_email
FROM
  profiles p
LEFT JOIN
  delivery_partners dp ON p.id = dp.user_id
WHERE
  p.role = 'delivery_partner' AND dp.user_id IS NULL;

-- Check for orders with invalid delivery_partner_id
SELECT
  o.id AS order_id,
  o.status,
  dp.id AS delivery_partner_id,
  dp.name AS delivery_partner_name
FROM
  orders o
LEFT JOIN
  delivery_partners dp ON o.delivery_partner_id = dp.id
WHERE
  o.delivery_partner_id IS NOT NULL AND dp.id IS NULL;
