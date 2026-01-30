import { MelCloudHomeIntegration } from "../../config/integration.zod";
import {
  Builder,
  By,
  until,
  WebDriver,
  logging,
  IWebDriverOptionsCookie,
} from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome.js";

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
    "--auto-open-devtools-for-tabs",
  );

  // Optional: set a common user agent to reduce some bot-detection
  options.addArguments(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
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
  melCloudHomeUrl: string,
  email: string,
  password: string,
) {
  await driver.get(melCloudHomeUrl);
  // TODO: There's a chance that there's an error and we need to refresh the page:
  // We should look for an error message and refresh if needed.
  // The message is "An unhandled error has occurred. Reload"

  let hasError = false;
  do {
    hasError = Boolean(
      await driver.wait(until.elementLocated(By.id("blazor-error-ui")), 2000),
    );

    if (hasError) {
      hasError = true;
      console.warn(`Page failure - requires refresh`);
      await driver.navigate().refresh();
    }
  } while (!hasError);

  const signInButton = await driver.wait(
    until.elementLocated(By.xpath("//button[normalize-space()='Sign In']")),
    15000,
  );
  if (!signInButton) {
    throw new Error(
      "Could not find SIGN IN button automatically. You may need to update selector.",
    );
  }
  await signInButton.click();

  const emailInput = await driver.wait(
    until.elementLocated(By.id("signInFormUsername")),
    5000,
  );
  await emailInput.sendKeys(email);
  const passwordInput = await driver.wait(
    until.elementLocated(By.id("signInFormPassword")),
    5000,
  );
  await passwordInput.sendKeys(password);
  await passwordInput.sendKeys("\n");
}

async function getMelCloudHomeSecureCookies(
  driver: WebDriver,
): Promise<IWebDriverOptionsCookie[]> {
  const allCookies = await driver.manage().getCookies();
  const monitorCookies = allCookies.filter((c) =>
    c.name.startsWith("__Secure-monitorandcontrol"),
  );

  return monitorCookies;
}

export async function getAuthorizationCookies(
  melCloudHomeConfig: MelCloudHomeIntegration,
): Promise<string> {
  const driver = await buildDriver();
  try {
    await clickSignInAndLogin(
      driver,
      melCloudHomeConfig.siteUrl,
      melCloudHomeConfig.username,
      melCloudHomeConfig.password,
    );
    await driver.sleep(2000); // small pause to ensure cookies are written
    const cookies = await getMelCloudHomeSecureCookies(driver);

    return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  } catch (error) {
    console.error("Error obtaining authorization cookies:", error);
    throw error;
  } finally {
    await driver.quit();
  }
}
