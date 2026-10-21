-- Fix "500: Database error querying schema" on login.
-- The migrated auth users were inserted with direct SQL, leaving GoTrue's nullable
-- string columns (confirmation_token, recovery_token, email_change, …) as NULL.
-- GoTrue's row scanner does sql.Scan into a string and fails on NULL → 500.
-- Fill those NULLs with '' (idempotent). Columns under a unique/primary constraint
-- (phone, id, email) are excluded to avoid duplicate-key violations.
-- Refs: https://supabase.com/docs/guides/troubleshooting/database-error-saving-new-user-RU_EwB

DO $$
DECLARE
  col text;
  has_null boolean;
BEGIN
  FOR col IN
    SELECT c.column_name FROM information_schema.columns c
    WHERE c.table_schema='auth' AND c.table_name='users'
      AND c.data_type IN ('text','character varying','character')
      AND c.column_name NOT IN ('encrypted_password','phone','id','email')
      AND NOT EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
        WHERE con.conrelid = 'auth.users'::regclass
          AND con.contype IN ('u','p')
          AND att.attname = c.column_name
      )
  LOOP
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM auth.users WHERE %I IS NULL)', col) INTO has_null;
    IF has_null THEN
      EXECUTE format('UPDATE auth.users SET %I = COALESCE(%I, '''') WHERE %I IS NULL', col, col, col);
    END IF;
  END LOOP;
END $$
