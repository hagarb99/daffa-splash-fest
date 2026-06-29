UPDATE auth.users
SET encrypted_password = crypt('Daffa@2026', gen_salt('bf')),
    updated_at = now()
WHERE email = 'jp.hagarbastawi@gmail.com';