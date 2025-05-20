/*
  # Create Blog Tables

  1. New Tables
    - `blog_posts`
      - `id` (serial, primary key)
      - `title` (text)
      - `content` (text)
      - `excerpt` (text, nullable)
      - `author` (text)
      - `image` (text)
      - `published_at` (timestamptz, nullable)
      - `category` (text, nullable)
      - `tags` (text[], nullable)
      - `views` (integer, default 0)
      - `published` (boolean, default false)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on blog_posts table
    - Add policies for CRUD operations
*/

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT NOT NULL,
  image TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  category TEXT,
  tags TEXT[],
  views INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to published posts"
  ON public.blog_posts
  FOR SELECT
  USING (published = true OR (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE is_admin = true
  )));

CREATE POLICY "Allow admins to create posts"
  ON public.blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE is_admin = true
  ));

CREATE POLICY "Allow admins to update posts"
  ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE is_admin = true
  ))
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE is_admin = true
  ));

CREATE POLICY "Allow admins to delete posts"
  ON public.blog_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE is_admin = true
  ));