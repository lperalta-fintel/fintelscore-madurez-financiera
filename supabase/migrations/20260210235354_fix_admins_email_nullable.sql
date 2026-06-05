/*
  # Fix admins email column to be nullable
  
  1. Changes
    - Make the email column nullable in the admins table
    - This allows creating admin users without requiring an email address
  
  2. Reason
    - The previous migration added email as NOT NULL without a default
    - This caused INSERT operations to fail
*/

ALTER TABLE admins ALTER COLUMN email DROP NOT NULL;