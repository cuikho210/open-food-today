CREATE TABLE IF NOT EXISTS public.recipes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(512),
    description TEXT,
    author BIGINT NOT NULL,
    image_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recipes_author ON recipes (author);
