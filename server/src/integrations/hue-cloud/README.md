# Philips Hue Integration

Setup your Hue Apps using [this link](https://developers.meethue.com/my-apps/). Make sure to setup the Callback URL, you might need to have a DNS tunnel and your machine exposed.
The Smart Home Management api itself will onboard you on the flow but it requires some manual steps.

Hue devices require a bridge, the V2 Cloud API will connect to the bridge and will poll the state from it.
Any action is also performed through this channel.

## OAuth2

Philips Hue uses OAUth2 to register their apps. This requires a few steps and some manual work.

1. The application needs a Code to start requesting Refresh and Authorization Tokens.
1. When you first run this server if there are on valid tokens it'll trigger the flow, but you can do it first.
1. Go to: [https://api.meethue.com/oauth2/auth?client_id=6d0ac389-2de5-4e22-a7d7-50711d9ae9d7&response_type=code&scope=remote_control&redirect_uri={{APP_DOMAIN_URL}}/api/auth/oauth2-hue](https://api.meethue.com/oauth2/auth?client_id=6d0ac389-2de5-4e22-a7d7-50711d9ae9d7&response_type=code&scope=remote_control&redirect_uri={{APP_DOMAIN_URL}}/api/auth/oauth2-hue) This link will be correctly formed in theory if you have an expired refresh token in the database when the server bootstraps.
1. Give access to your bridge, just follow the instructions and you'll get the call to the callback you set on the Hue Apps page.
1. The callback will then send a code, on the [AuthHueController](./../../controllers/auth-hue/auth-hue.controller.ts) you can see the `oauth2` function that should return the next steps and print the code.
1. Follow the steps written in the API, but you can instead do the following Curls:

### Get the Tokens from the Code

```bash
curl -X POST "${HUE_API_URL}/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "code=YOUR_AUTH_CODE" \
  --data-urlencode "client_id=YOUR_CLIENT_ID" \
  --data-urlencode "client_secret=YOUR_CLIENT_SECRET" \
  --data-urlencode "redirect_uri=YOUR_REDIRECT_URI"
```

Store the token in the database using the correct table `hue_cloud_auth_tokens`.

### Create a User in your Hue Bridge

```bash
curl -X POST "https://api.meethue.com/bridge" \
  -H "Authorization: Bearer ${accessToken.accessToken}" \
  -H "Content-Type: application/json" \
  -d '{"devicetype":"my_server#your_name"}
```

Store the `success.username` from the response. This is the `username` you'll use for future requests with the API.

## Integration config

On the `json.config` file, in the integrations array add:

```json
{
  "name": "hue_cloud",
  "apiUrl": "https://api.meethue.com",
  "clientId": "{{HUE_CLOUD_CLIENT_ID}}",
  "clientSecret": "{{HUE_CLOUD_SECRET}}",
  "redirectUri": "{{APP_DOMAIN_URL}}/api/auth/oauth2-hue",
  "bridgeUsername": "{{HUE_CLOUD_BRIDGE_USERNAME}}"
}
```

## Device Types Supported

For each type there's a set of different supported parameters in the config:

Integration Schema:

```ts
type HueIntegration = {
  name: "hue_cloud";
  id: string | string[]; // Used for multiple device controls, the ID is obtained
};
```

To find the IDs the API supports a sandbox endpoint: `http://localhost:3001/api/sandbox/hue-lights`.

### Smart Plugs

device.type: `smart_switch`
parameters schema:

```ts
type Action = {
  id: "on" | "off";
  name: string;
};
```

### Smart Lights

device.type: `smart_lights`
parameters schema:

```ts
type Action = {
  id: string;
  name: string;
  parameters: LightStateParameters;
};

type LightStateParameters = {
  on?: boolean;
  bri?: number;
  hue?: number;
  sat?: number;
  effect?: string;
  xy?: readonly unknown[];
  ct?: number;
  alert?: string;
  colormode?: "xy" | "ct" | "hs";
  mode?: string;
  reachable?: boolean;
};
```

### Example Device Config

```json
{
  "id": "ceiling_light",
  "name": "Ceiling Light",
  "icon": "ceiling_light",
  "type": "smart_light",
  "integration": {
    "name": "hue_cloud",
    "id": "2"
  },
  "actions": [
    {
      "id": "off",
      "name": "Off",
      "parameters": {
        "on": false
      }
    },
    {
      "id": "on_bright",
      "name": "Bright",
      "parameters": {
        "on": true,
        "bri": 254,
        "hue": 6924,
        "sat": 129
      }
    },
    {
      "id": "on_dim",
      "name": "Dim",
      "parameters": {
        "on": true,
        "bri": 44,
        "hue": 7985,
        "sat": 107
      }
    },
    {
      "id": "on_romantic",
      "name": "Romantic",
      "parameters": {
        "on": true,
        "bri": 115,
        "hue": 62965,
        "sat": 254
      }
    }
  ]
}
```
