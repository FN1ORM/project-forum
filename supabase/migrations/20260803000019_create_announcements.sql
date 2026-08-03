-- Install moddatetime extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    resources JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(resources) = 'array'),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices for performance
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX idx_announcements_is_pinned ON announcements(is_pinned) WHERE is_pinned = true;

-- Trigger to automatically update the updated_at timestamp
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read announcements
CREATE POLICY "Announcements are viewable by everyone" ON announcements
    FOR SELECT USING (true);

-- 2. Teachers and Admins can insert announcements
CREATE POLICY "Teachers and admins can insert announcements" ON announcements
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'teacher' OR profiles.role = 'admin')
        )
    );

-- 3. Teachers and Admins can update any announcement
CREATE POLICY "Teachers and admins can update any announcement" ON announcements
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'teacher' OR profiles.role = 'admin')
        )
    );

-- 4. Teachers and Admins can delete any announcement
CREATE POLICY "Teachers and admins can delete any announcement" ON announcements
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'teacher' OR profiles.role = 'admin')
        )
    );
