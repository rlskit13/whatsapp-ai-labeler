import { chromium } from 'playwright';
import { config } from './config.js';
import { logger } from './logger.js';
import { SELECTORS } from './selectors.js';

// Launches Chrome with a persistent profile so the WhatsApp Web session survives restarts
// (no QR re-scan needed once logged in), then waits until it is actually connected.
export async function launchWhatsAppSession() {
  const context = await chromium.launchPersistentContext(config.userDataDir, {
    headless: false, // WhatsApp Web behaves unreliably / blocks headless sessions
    viewport: { width: 1280, height: 900 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://web.whatsapp.com', { waitUntil: 'domcontentloaded' });

  await waitForConnection(page);
  return { context, page };
}

// Polls until either the chat list (logged in) or a login timeout is reached.
// Prints a reminder to scan the QR code while one is on screen.
export async function waitForConnection(page, { timeoutMs = 120000 } = {}) {
  logger.info('Checking WhatsApp Web connectivity/login status...');
  const chatList = page.locator(SELECTORS.chatListPane);
  const qr = page.locator(SELECTORS.qrCode);

  const deadline = Date.now() + timeoutMs;
  let warned = false;
  while (Date.now() < deadline) {
    if ((await chatList.count()) > 0 && (await chatList.isVisible().catch(() => false))) {
      logger.info('WhatsApp Web is connected and logged in.');
      return true;
    }
    if ((await qr.count()) > 0 && (await qr.isVisible().catch(() => false))) {
      if (!warned) {
        logger.warn('Not logged in yet - scan the QR code with WhatsApp on your phone (Linked devices > Link a device).');
        warned = true;
      }
    }
    await page.waitForTimeout(2000);
  }
  throw new Error('Timed out waiting for WhatsApp Web login/connection.');
}

// WhatsApp Web shows a banner when the linked phone loses internet connectivity.
export async function isOnline(page) {
  const banner = page.locator(SELECTORS.offlineBanner);
  return !((await banner.count()) > 0 && (await banner.isVisible().catch(() => false)));
}

export async function waitUntilOnline(page, { intervalMs = 3000 } = {}) {
  let warned = false;
  while (!(await isOnline(page))) {
    if (!warned) {
      logger.warn('Phone/computer appears disconnected - waiting for reconnection...');
      warned = true;
    }
    await page.waitForTimeout(intervalMs);
  }
}
