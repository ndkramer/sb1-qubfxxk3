/*
  # Update notes table module_id type

  1. Changes
    - Change `module_id` column type from UUID to TEXT in notes table
    - This allows string-based module IDs to be used instead of UUIDs
    - Maintains existing foreign key relationship with modules table
    
  2. Security
    - Existing RLS policies remain unchanged
    - Data integrity is preserved during type conversion
*/

DO $$ 
BEGIN
  -- First check if the column exists and is of type uuid
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notes' 
    AND column_name = 'module_id' 
    AND data_type = 'uuid'
  ) THEN
    -- Temporarily drop the foreign key constraint
    ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_module_id_fkey;
    
    -- Change the column type
    ALTER TABLE notes ALTER COLUMN module_id TYPE TEXT USING module_id::TEXT;
    
    -- Add back the foreign key constraint with the new type
    ALTER TABLE notes 
    ADD CONSTRAINT notes_module_id_fkey 
    FOREIGN KEY (module_id) 
    REFERENCES modules(id) 
    ON DELETE CASCADE;
  END IF;
END $$;