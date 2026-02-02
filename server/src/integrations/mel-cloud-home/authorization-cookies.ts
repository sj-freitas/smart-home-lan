import { MelCloudHomeIntegration } from "../../config/integration.zod";
import puppeteer, { Browser, BrowserContext, Page } from "puppeteer";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36";

// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Build a Browser instance.
 * - Connects to remote Chrome if CHROME_WS_ENDPOINT is set
 * - Otherwise launches a local headless browser
 */
async function buildBrowser(): Promise<Browser> {
  const wsEndpoint = process.env.CHROME_WS_ENDPOINT;

  if (wsEndpoint) {
    console.log(`Connecting to remote Chrome: ${wsEndpoint}`);
    return puppeteer.connect({ browserWSEndpoint: wsEndpoint });
  }

  console.log("Launching local headless Chrome");
  return puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });
}

/**
 * Refreshes the page if the Blazor error overlay is detected.
 */
async function ensurePageHealthy(page: Page, maxAttempts = 6): Promise<void> {
  for (let i = 1; i <= maxAttempts; i++) {
    // await sleep(1000);

    const blazorError = await page.$("#blazor-error-ui");
    if (!(await blazorError.isVisible())) return;

    console.warn(
      `Detected #blazor-error-ui (attempt ${i}/${maxAttempts}) — refreshing`,
    );

    await page.reload({
      waitUntil: ["domcontentloaded", "networkidle2"],
    });
  }

  console.warn("Max health-check attempts reached; continuing anyway.");
}

/**
 * Waits for and returns the "Sign In" button.
 */
// async function waitForSelector(
//   page: Page,
//   selector: string,
//   timeoutMs = 15_000,
// ) {
//   const button = await page.waitForSelector(selector, { timeout: timeoutMs });

//   if (!button) {
//     throw new Error("Sign In button not found");
//   }

//   return button;
// }

/**
 * Navigate to the site and perform login.
 */
async function clickSignInAndLogin(
  page: Page,
  melCloudHomeUrl: string,
  email: string,
  password: string,
): Promise<void> {
  await page.goto(melCloudHomeUrl, {
    waitUntil: ["domcontentloaded", "networkidle2"],
  });

  await ensurePageHealthy(page);

  const signInButtonSelector = "xpath=//button[normalize-space() = 'Sign In']";
  const signInButton = await page.waitForSelector(signInButtonSelector);
  // const signInButton = await waitForSelector(
  //   page,
  //   signInButtonSelector,
  // );
  await signInButton.click();

  const emailSelector = "#signInFormUsername";
  const passwordSelector = "#signInFormPassword";

  await page.waitForSelector(emailSelector, { timeout: 5000 });
  await page.waitForSelector(passwordSelector, { timeout: 5000 });

  await page.type(emailSelector, email, { delay: 30 });
  await page.type(passwordSelector, password, { delay: 30 });

  await page.keyboard.press("Enter");

  // Allow login redirect + cookie write
  // await sleep(2000);
}

/**
 * Extract secure MELCloud cookies.
 */
// async function getMelCloudHomeSecureCookies(page: Page): Promise<string[]> {
//   const cookies = await page.cookies();
//   return cookies
//     .filter((c) => c.name.startsWith("__Secure-monitorandcontrol"))
//     .map((c) => `${c.name}=${c.value}`);
// }

async function getMelCloudHomeSecureCookies(
  browser: BrowserContext,
): Promise<string[]> {
  const cookies = await browser.cookies();
  return cookies
    .filter((c) => c.name.startsWith("__Secure-monitorandcontrol"))
    .map((c) => `${c.name}=${c.value}`);
}

/**
 * Public API
 */
export async function getAuthorizationCookies(
  melCloudHomeConfig: MelCloudHomeIntegration,
): Promise<string> {
  let browser: Browser | null = null;

  try {
    browser = await buildBrowser();

    // In Puppeteer v22+, ALL created contexts are incognito
    const context = await browser.createBrowserContext();
    const page = await context.newPage();

    await page.setUserAgent({
      userAgent: DEFAULT_USER_AGENT,
    });
    page.setDefaultTimeout(30_000);
    page.setDefaultNavigationTimeout(60_000);

    console.log("Attempting MELCloud sign-in");

    try {
      await clickSignInAndLogin(
        page,
        melCloudHomeConfig.siteUrl,
        melCloudHomeConfig.username,
        melCloudHomeConfig.password,
      );

      // await sleep(2000);

      const cookies = await getMelCloudHomeSecureCookies(page.browserContext());

      if (!cookies.length) {
        console.warn("No monitor cookies found");
        return "";
      }

      console.log("[SUCCESS] Authorization cookies retrieved");
      return cookies.join("; ");
    } finally {
      await context.close();
    }
  } catch (err) {
    console.error("Failed to obtain authorization cookies:", err);
    throw err;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
