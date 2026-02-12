# Shelly Integration

**Current Shelly integration is only supported via Shelly's Actions (Webhooks)**
There's plans for future support for other kinds of integrations depending on the devices I use. But currently devices of the type `temperature_humidity_sensor` do not have actions and due to the lower power nature of them instead of polling them via the cloud we subscribe to their events.

## Setting up a Shelly Action

On the Shelly [Cloud Control Panel](https://control.shelly.cloud/) register your devices and then set the actions:

### Create 2 actions

To make this work properly you need to setup in the config or .env a variable for your Shelly Auth token. For example, in `config.json`:

```json
{
  "name": "shelly",
  "webhookSecret": "{{SHELLY_WEBHOOK_SECRET}}"
}
```

Then set the `SHELLY_WEBHOOK_SECRET` in your .env, this doesn't need to be any secret value, just generate one using your computer. A UUID can also work.
Make sure to then setup your webhooks with the correct query parameter: `token=<SHELLY_WEBHOOK_SECRET>`. This is important as it'll be used by the server to identify that the Shelly requests are legit.

DeviceId is also arbitrary since Shelly's webhooks don't need a real device ID, you can use one yourself. I am using a similar system to HueLights where the IDs are the sequence of devices `"0"`, `"1"`, etc.

#### Humidity Event Action

1. Name: `Humidity Event`.
2. Condition: `Humidity Change`, `Any`.
3. URLs: `https://palais-freitas.xyz/api/shelly/webhooks?rh=${ev.rh}&device_id=<DEVICE_ID>&token=<SHELLY_WEBHOOK_SECRET>`
   Make sure the replace `DEVICE_ID` and `SHELLY_WEBHOOK_SECRET` with the correct values when setting it up.

#### Temperature Event Action

1. Name: `Temperature Event`.
2. Condition: `Temperature Change`, `Any`.
3. URLs: `https://palais-freitas.xyz/api/shelly/webhooks?tc=${ev.tc}&device_id=<DEVICE_ID>&token=<SHELLY_WEBHOOK_SECRET>`
   Make sure the replace `DEVICE_ID` and `SHELLY_WEBHOOK_SECRET` with the correct values when setting it up.
   I'm using `tc` as we only want the temperatures in celsius. I'd say that we can convert celsius to fahrenheit on the server side.

## Device Types Supported

Shelly integration currently only supports `temperature_humidity_sensor`s. But using the `actions` system and the `ShellyController` it's very easy to subscribe to other state changes from other devices with minimal effort.
Integration Schema:

```ts
type ShellyIntegration = {
  name: "shelly";
  id: string; // Arbitrary ID that is used for the webhook
};
```

### Example Device Config

Devices with no actions aren't rendered on the UI.
Make sure to set the `roomInfo` with your sensor id:

```json
"roomInfo": {
  "temperatureDeviceId": "<room_id>/<sensor_id>",
  "humidityDeviceId": "<room_id>/<sensor_id>"
}
```

For an example on how to setup a TEmperature and Humidity sensor:

```json
{
  "id": "sensor",
  "name": "Sensor",
  "icon": "thermometer",
  "type": "temperature_humidity_sensor",
  "integration": {
    "name": "shelly",
    "id": "0"
  },
  "actions": []
}
```
The webhook calls should update the state for this device and the state should be updated via sockets too.
