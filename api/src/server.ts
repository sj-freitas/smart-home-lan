import express, { Request, Response, NextFunction } from "express";
import { TuyaContext } from "@tuya/tuya-connector-nodejs";
import {
  Builder,
  By,
  until,
  WebDriver,
  logging,
  IWebDriverOptionsCookie,
} from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome.js";

let GLOBAL_SECURE_COOKIEs: IWebDriverOptionsCookie[] = [];

// const USER = "sjcsgfreitas@hotmail.com";
// const USER = "sergioasaservice@gmail.com";
// const PASSWORD = "vombenxiNquxju3";
const MELCLOUD_HOME_URL = "https://melcloudhome.com/";

const DEVICE_ID = "bf78bae7fcbea83154ec1o";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

// Console-logging middleware for /home
const homeLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`[HOME] ${req.method} ${req.originalUrl}`);
  next();
};

app.use("/tree", homeLogger);

// Async-ready route handler for /home
app.get("/tree/on", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Let's try integration with Tuya
    const tuya = new TuyaContext({
      baseUrl: "https://openapi.tuyaeu.com",
      accessKey: "pqe8fh57a53j97ceduen",
      secretKey: "9d49ac04d0184f38bd9276469e7880ce",
    });

    const device = await tuya.device.detail({
      device_id: "bf78bae7fcbea83154ec1o",
    });

    const result = await tuya.request({
      path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
      method: "POST",
      body: { commands: [{ code: "switch_1", value: true }] },
    });

    res.json({ message: "This is on!", result, device });
  } catch (err) {
    next(err);
  }
});

app.get(
  "/tree/off",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Let's try integration with Tuya
      const tuya = new TuyaContext({
        baseUrl: "https://openapi.tuyaeu.com",
        accessKey: "pqe8fh57a53j97ceduen",
        secretKey: "9d49ac04d0184f38bd9276469e7880ce",
      });

      const device = await tuya.device.detail({
        device_id: "bf78bae7fcbea83154ec1o",
      });

      const result = await tuya.request({
        path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
        method: "POST",
        body: { commands: [{ code: "switch_1", value: false }] },
      });

      res.json({ message: "This is off!", device, result });
    } catch (err) {
      next(err);
    }
  }
);

async function buildDriver(): Promise<WebDriver> {
  const options = new chrome.Options();
  // Use a visible browser while developing; switch to headless if desired:
  // options.headless();
  options.addArguments(
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-infobars",
    "--disable-blink-features=AutomationControlled",
    "--window-size=1280,1024",
    "--auto-open-devtools-for-tabs"
  );

  // Optional: set a common user agent to reduce some bot-detection
  options.addArguments(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
  );

  // Show browser logs if you want
  const prefs = new logging.Preferences();
  prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  const service = new chrome.ServiceBuilder(); // chromedriver comes from installed package
  return new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(service)
    .build();
}

async function clickSignInAndLogin(
  driver: WebDriver,
  email: string,
  password: string
) {
  await driver.get(MELCLOUD_HOME_URL);
  const signInButton = await driver.wait(
    until.elementLocated(By.xpath("//button[normalize-space()='Sign In']")),
    15000
  );
  if (!signInButton) {
    throw new Error(
      "Could not find SIGN IN button automatically. You may need to update selector."
    );
  }
  await signInButton.click();

  // APPROACH A
  // Make the form visible if it's hidden
  // await driver.sleep(1000);

  const emailInput = await driver.wait(
    until.elementLocated(By.id("signInFormUsername")),
    5000
  );
  await emailInput.sendKeys(email);
  const passwordInput = await driver.wait(
    until.elementLocated(By.id("signInFormPassword")),
    5000
  );
  await passwordInput.sendKeys(password);
  await passwordInput.sendKeys("\n");
}

async function getMelCloudHomeSecureCookies(
  driver: WebDriver
): Promise<IWebDriverOptionsCookie[]> {
  const allCookies = await driver.manage().getCookies();
  const monitorCookies = allCookies.filter((c) =>
    c.name.startsWith("__Secure-monitorandcontrol")
  );

  return monitorCookies;
}

app.get("/cookie", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Store these as credentials safely in env vars or a secrets manager
    const MELCLOUD_HOME_USERNAME = "NOPE";
    const MELCLOUD_HOME_PASSWORD = "NOPE";

    const email = MELCLOUD_HOME_USERNAME;
    const password = MELCLOUD_HOME_PASSWORD;

    const driver = await buildDriver();
    try {
      await clickSignInAndLogin(driver, email, password);
      await driver.sleep(2000); // small pause to ensure cookies are written
      const cookies = await getMelCloudHomeSecureCookies(driver);

      GLOBAL_SECURE_COOKIEs = cookies;

      res.json({ cookies });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Failed to retrieve cookies" });
    } finally {
      await driver.quit();
    }
  } catch (err) {
    next(err);
  }
});

app.get(
  "/ac/living-room/on",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // LIST DEVICES
      const response = await fetch(
        "https://melcloudhome.com/api/user/context",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-csrf": "1",
            Cookie: GLOBAL_SECURE_COOKIEs.map(
              (c) => `${c.name}=${c.value}`
            ).join("; "),
          },
        }
      );

      const jsonResponse = await response.json();
      const livingRoomDeviceId = jsonResponse.buildings[0].airToAirUnits.find(
        (d: any) => d.givenDisplayName === "Living Room"
      )?.id;
      
      if (!livingRoomDeviceId) {
        throw new Error("Living Room device not found");
      }

      // TURN ON DEVICE
      const switchResponse = await fetch(
        `https://melcloudhome.com/api/ataunit/${livingRoomDeviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-csrf": "1",
            Cookie: GLOBAL_SECURE_COOKIEs.map(
              (c) => `${c.name}=${c.value}`
            ).join("; "),
          },
          body: JSON.stringify({
            power: true,
            operationMode: null,
            setFanSpeed: null,
            vaneHorizontalDirection: null,
            vaneVerticalDirection: null,
            setTemperature: null,
            temperatureIncrementOverride: null,
            inStandbyMode: null,
          }),
        }
      );

      console.log("Switch Response Status:", switchResponse);

      res.json({ message: "AC Living Room On - Not Implemented Yet" });
    } catch (err) {
      next(err);
    }
  }
);

app.get(
  "/ac/list",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // LIST DEVICES
      const response = await fetch(
        "https://melcloudhome.com/api/user/context",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-csrf": "1",
            Cookie: GLOBAL_SECURE_COOKIEs.map(
              (c) => `${c.name}=${c.value}`
            ).join("; "),
          },
        }
      );

      const jsonResponse = await response.json();
      const { airToAirUnits } = jsonResponse.buildings[0] ??  [];

      console.log(airToAirUnits);

      const devices = airToAirUnits.map(
        (d: any) => ({
          id: d.id,
          room: {
            name: d.givenDisplayName,
            temperature: d.settings.find((currSetting: any) => currSetting.name === "RoomTemperature")?.value ?? NaN,
          },
          power: d.settings.find((currSetting: any) => currSetting.name === "Power")?.value === "True" ? true : false,
          isConnected: d.isConnected,
          isInError: d.isInError,
        })
      );

      console.log({ devices });

      res.json({ devices });
    } catch (err) {
      next(err);
    }
  }
);

app.get(
  "/ac/living-room/off",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // LIST DEVICES
      const response = await fetch(
        "https://melcloudhome.com/api/user/context",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-csrf": "1",
            Cookie: GLOBAL_SECURE_COOKIEs.map(
              (c) => `${c.name}=${c.value}`
            ).join("; "),
          },
        }
      );

      const jsonResponse = await response.json();
      const livingRoomDeviceId = jsonResponse.buildings[0].airToAirUnits.find(
        (d: any) => d.givenDisplayName === "Living Room"
      )?.id;
      
      if (!livingRoomDeviceId) {
        throw new Error("Living Room device not found");
      }

      // TURN ON DEVICE
      const switchResponse = await fetch(
        `https://melcloudhome.com/api/ataunit/${livingRoomDeviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-csrf": "1",
            Cookie: GLOBAL_SECURE_COOKIEs.map(
              (c) => `${c.name}=${c.value}`
            ).join("; "),
          },
          body: JSON.stringify({
            power: false,
            operationMode: null,
            setFanSpeed: null,
            vaneHorizontalDirection: null,
            vaneVerticalDirection: null,
            setTemperature: null,
            temperatureIncrementOverride: null,
            inStandbyMode: null,
          }),
        }
      );

      console.log("Switch Response Status:", switchResponse);

      res.json({ message: "AC Living Room On - Not Implemented Yet" });
    } catch (err) {
      next(err);
    }
  }
);


// Generic error handler (supports async errors)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
