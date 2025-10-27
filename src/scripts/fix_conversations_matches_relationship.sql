-- Add missing foreign key relationship between conversations and matches
-- This fixes the error: "Could not find a relationship between 'conversations' and 'matches' in the schema cache"

ALTER TABLE public.conversations
ADD CONSTRAINT conversations_match_id_fkey 
FOREIGN KEY (match_id) REFERENCES public.matches(id);

-- Optional: Add an index on match_id for better performance if not already exists
CREATE INDEX IF NOT EXISTS idx_conversations_match_id 
ON public.conversations(match_id);

