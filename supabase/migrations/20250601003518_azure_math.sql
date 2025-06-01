/*
  # Fix enrollments RLS policies

  1. Changes
    - Drop existing RLS policies for enrollments table that may be causing recursion
    - Create simplified RLS policies for enrollments table:
      - Users can read their own enrollments
      - Instructors can read enrollments for their classes
      - Users can manage their own enrollments

  2. Security
    - Maintains RLS protection
    - Simplifies policy logic to prevent recursion
    - Ensures proper access control for students and instructors
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "enable_enrollment_management" ON enrollments;
DROP POLICY IF EXISTS "enable_instructor_enrollment_view" ON enrollments;

-- Create new, simplified policies

-- Allow users to read their own enrollments
CREATE POLICY "users_read_own_enrollments"
ON enrollments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow instructors to read enrollments for their classes
CREATE POLICY "instructors_read_class_enrollments"
ON enrollments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = enrollments.class_id
    AND classes.instructor_id = auth.uid()
  )
);

-- Allow users to manage their own enrollments
CREATE POLICY "users_manage_own_enrollments"
ON enrollments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());