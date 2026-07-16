UPDATE auth.users SET email_confirmed_at = now() WHERE email IN ('demo@swiftcommerce.dev', 'admin@swiftcommerce.dev') AND email_confirmed_at IS NULL;
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'admin@swiftcommerce.dev'
ON CONFLICT (user_id, role) DO NOTHING;