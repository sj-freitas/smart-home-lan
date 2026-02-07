INSERT INTO
    "public"."hue_cloud_auth_tokens" (
        "id",
        "created_at",
        "access_token",
        "access_token_expires_in",
        "expires_in",
        "refresh_token",
        "refresh_token_expires_in",
        "token_type"
    )
VALUES
    (
        -- Mock expired Token
        'aaaaaaaa',
        '2025-01-01 00:00:00.00000+00',
        'bbbbbbbb',
        '604800',
        '604800',
        'cccccccc',
        '63120000',
        'bearer'
    );