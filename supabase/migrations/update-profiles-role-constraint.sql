-- Update the role constraint to include delivery_partner
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'retailer', 'wholesaler', 'delivery_partner'));
