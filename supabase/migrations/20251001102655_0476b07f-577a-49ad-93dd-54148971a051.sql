-- Create storage bucket for support attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'support-attachments', 
  'support-attachments', 
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for support attachments storage
CREATE POLICY "Users can upload attachments to their conversations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'support-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view attachments in their conversations"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'support-attachments' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'support-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add last_read_at to support_conversations for unread tracking
ALTER TABLE support_conversations 
ADD COLUMN IF NOT EXISTS last_read_at timestamptz DEFAULT now();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_support_conversations_updated 
ON support_conversations (updated_at DESC);