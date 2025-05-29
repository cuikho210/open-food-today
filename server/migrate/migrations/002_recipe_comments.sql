CREATE TABLE IF NOT EXISTS recipe_comments (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    parent_id BIGINT REFERENCES recipe_comments(id), -- NULL for top-level comments
    reply_to BIGINT REFERENCES recipe_comments(id), -- NULL for top-level comments
    level SMALLINT NOT NULL, -- 0 for top, 1 for reply 1, 2 for reply 2
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index on user_id for efficient lookup of comments by user
CREATE INDEX IF NOT EXISTS idx_recipe_comments_user_id ON recipe_comments (user_id);

-- Add index on recipe_id for efficient lookup of comments for a recipe
CREATE INDEX IF NOT EXISTS idx_recipe_comments_recipe_id ON recipe_comments (recipe_id);

-- Add index on parent_id for efficient lookup of replies
CREATE INDEX IF NOT EXISTS idx_recipe_comments_parent_id ON recipe_comments (parent_id);

-- Add constraint for the level field
ALTER TABLE recipe_comments
ADD CONSTRAINT chk_recipe_comments_level CHECK (level >= 0 AND level <= 2);

-- Add a trigger function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists to allow re-running migration
DROP TRIGGER IF EXISTS update_recipe_comments_updated_at ON recipe_comments;

-- Add a trigger to automatically update updated_at on row update
CREATE TRIGGER update_recipe_comments_updated_at
BEFORE UPDATE ON recipe_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
