-- Create recipe_likes table
CREATE TABLE IF NOT EXISTS recipe_likes (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recipe_id, user_id) -- Prevent duplicate likes from same user
);

-- Add index on recipe_id for efficient lookup of likes for a recipe
CREATE INDEX IF NOT EXISTS idx_recipe_likes_recipe_id ON recipe_likes (recipe_id);

-- Add index on user_id for efficient lookup of likes by user
CREATE INDEX IF NOT EXISTS idx_recipe_likes_user_id ON recipe_likes (user_id);

-- Add index on the combination for efficient queries
CREATE INDEX IF NOT EXISTS idx_recipe_likes_recipe_user ON recipe_likes (recipe_id, user_id);