create table
    public.home_state (
        id uuid not null default gen_random_uuid (),
        name text not null,
        state json not null,
        constraint home_state_pkey primary key (id),
        constraint home_state_name_key unique (name)
    ) TABLESPACE pg_default;