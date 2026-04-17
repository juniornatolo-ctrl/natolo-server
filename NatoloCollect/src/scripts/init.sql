CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    schema JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE submissions (
    id UUID PRIMARY KEY,
    form_id UUID REFERENCES forms(id),
    data JSONB NOT NULL,
    metadata JSONB,
    validation_status TEXT DEFAULT 'PENDING',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
