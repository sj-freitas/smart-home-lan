-- Ensure required extension exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================
-- hue_cloud_auth_tokens
-- ============================
CREATE TABLE
    IF NOT EXISTS public.hue_cloud_auth_tokens (
        id uuid NOT NULL DEFAULT gen_random_uuid (),
        created_at timestamptz NOT NULL DEFAULT now (),
        access_token varchar NOT NULL,
        access_token_expires_in varchar NOT NULL,
        expires_in bigint NOT NULL,
        refresh_token varchar NOT NULL,
        refresh_token_expires_in varchar NOT NULL,
        token_type varchar NOT NULL,
        CONSTRAINT hue_cloud_auth_tokens_pkey PRIMARY KEY (id)
    ) TABLESPACE pg_default;

-- ============================
-- auth_api_keys
-- ============================
CREATE TABLE
    IF NOT EXISTS public.auth_api_keys (
        id uuid NOT NULL DEFAULT gen_random_uuid (),
        created_at timestamptz NOT NULL DEFAULT now (),
        api_key_hash text NOT NULL,
        owner text NOT NULL,
        expires_at timestamptz NOT NULL,
        CONSTRAINT auth_api_keys_pkey PRIMARY KEY (id),
        CONSTRAINT api_keys_owner_key UNIQUE (owner)
    ) TABLESPACE pg_default;

-- ============================
-- auth_emails
-- ============================
CREATE TABLE
    IF NOT EXISTS public.auth_emails (
        id uuid NOT NULL DEFAULT gen_random_uuid (),
        created_at timestamptz NOT NULL DEFAULT now (),
        expires_at timestamptz NOT NULL,
        email_address text NOT NULL,
        starts_at timestamptz NOT NULL,
        CONSTRAINT auth_authorised_emails_pkey PRIMARY KEY (id)
    ) TABLESPACE pg_default;

-- ============================
-- auth_google_sessions
-- ============================
CREATE TABLE
    IF NOT EXISTS public.auth_google_sessions (
        id uuid NOT NULL DEFAULT gen_random_uuid (),
        email text NOT NULL,
        access_token text NOT NULL,
        refresh_token text,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now (),
        CONSTRAINT auth_google_sessions_pkey PRIMARY KEY (id)
    ) TABLESPACE pg_default;