# Philips Hue Integration


## OAuth2
Philips Hue uses OAUth2 to register their apps. This requires a few steps and some manual work.
1. The application needs a Code to start requesting Refresh and Authorization Tokens.
2. When you first run this server if there are on valid tokens it'll trigger the flow, but you can do it first: 
    1. Go to: [https://api.meethue.com/oauth2/auth?client_id=6d0ac389-2de5-4e22-a7d7-50711d9ae9d7&response_type=code&scope=remote_control&redirect_uri={{APP_DOMAIN_URL}}/api/auth/oauth2-hue](https://api.meethue.com/oauth2/auth?client_id=6d0ac389-2de5-4e22-a7d7-50711d9ae9d7&response_type=code&scope=remote_control&redirect_uri={{APP_DOMAIN_URL}}/api/auth/oauth2-hue)
3. 