
# Important
The backend reads the config file, store the file anywhere, you can set the path to it using CONFIG_PATH, it needs to be a JSON file,
the schema is written in zod here: [base-config.zod.ts](./src/config/base-config.zod.ts) the types are all referenced there. Each integration
can have their own types specified within the [integrations directory](./src/integrations).

1. When the app bootstraps it'll read the config file.
2. It'll look for any value marked with `{{ENV_VAR_NAME}}` and it'll replace it as a simple text replacement with the .env var if it exists, otherwise it'll throw an error.
3. Depending on the integrations it'll run the initialization code for that integration i.e. get an auth token, cookies, etc.
4. Integration configs for Actions are only run

## Key Concepts
### Config
The config is the unique source of truth for a home. The config can contain one Home and a Home can contain as many Rooms as you wish.
Any room can have as many Devices as needed. Devices can be shared across rooms, but controlling it in one room will impact other rooms.
The full config is served as a generic version on `http://localhost:3001/api/home` where the IDs are the ones specified on the config, this will be the source of truth.
Check the example / base config at [config.json](./config.json)

### Integration
An integration is an element that specifies what service they are using, each integration has a unique schema. Currently there are only 3 integrations supported and these
are tied to the code, maybe in the future I'll have a different repo for each integration and add them as NPM packages. However this isn't really very important right now,
any fork of this repo can add as many integrations as necessary.

Currently these are the supported integrations:
- [Philips Hue](./src/integrations/hue-cloud/README.md)
- [Tuya (Nedis Smart Life)](./src/integrations/tuya/README.md)
- [MEL Cloud Home](./src/integrations/mel-cloud-home/README.md)

### Device
The device that we are trying to control, a device is tied to an integration and can have different fields depending on it.
The device has a list of presets called Actions.

### Action
An action is the operation you can do through a device, Actions are performed through a route such as `http://localhost:3001/{room_id}/{device_id}/{actiomn_id}` and these are all
the ones defined in the config file. Once an Action is performed, the specific Integration will run that action based on the parameters in the config file. This should successfully
result in the state of the Device changing such as, for example, turning on some lights or switching their color.

## Env Vars
In the `.env` please include the following Environmental Variables:
```shell
# ENV Vars that do not depend on your config:
PORT=3001 # Defaults to 3001.
CONFIG_PATH="../config.json" # Mandatory, points to your config file. You can use the example one as a base.

# You don't need these but if you use the example ./config.json these are the specified there.
# If you don't version the file you can use the values directly in it.
MEL_CLOUD_HOME_USERNAME=""
MEL_CLOUD_HOME_PASSWORD=""
TUYA_CLOUD_ACCESS_KEY=""
TUYA_CLOUD_SECRET_KEY=""
HUE_CLOUD_CLIENT_ID=""
HUE_CLOUD_SECRET=""
HUE_CLOUD_OAUTH2="" # This Username is obtained after completing the OAuth2 flow and it is used to retrieve the lights and perform state changes.
HUE_CLOUD_BRIDGE_USERNAME=""

# Optional Values also dependant on the config.json
APP_HOME_IP="" # It is used to enable the restricted remote mode. Allows only users within the IP to use the app, otherwise it's readonly.
APP_DOMAIN_URL="" # Domain is used for OAuth2 but also for the SSL certification
DATABASE_URL="" # Database is used to persist tokens and user access
MY_HOME_ADDRESS_1= # Address line one to be shown on the app. Please be sure to not version these to not dox yourself!
MY_HOME_ADDRESS_2= # Address line two to be shown on the app. Please be sure to not version these to not dox yourself!
```

# Building
For production build just run `npm run build` and the 

# Running
All API routes are served on `/api/`.
Documentation for the routes can be seen using the [Bruno Requests](../smart_home_requests) you can [get Bruno via Homebrew](https://formulae.brew.sh/formula/bruno-cli).
The API is very simple and it also services WebSockets using the `/api/state` route and sockets are served on `/api/socket.io`.

## Running Locally
To run locally simple do `npm run start:dev`. The default port is 3001.

## Running Docker
### Before Building
Make sure that this config matches your machine's platform (or wherever you are hosting)
```yml
  app:
    platform: linux/arm64
```
Or you can use the current docker-compose.yml as long as you set the HOST_PLATFORM on your .env
for Mac ARM just set to `"linux/arm64"`.

### Running
Building: `docker compose -f docker-compose.yml --env-file .env up -d --no-deps --build`
It'll run the server and you can access it on the same way as usual.

