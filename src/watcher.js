import { logger } from './logger.js';
import { scanUnreadChatsOnce } from './scanner.js';
import { waitUntilOnline } from './browserSession.js';
import { config } from './config.js';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Keeps polling for unread/new messages until Ctrl+C, saving state after each pass.
export async function watchLoop(page, state, saveStateFn) {
  logger.info(`Entering watch mode (poll every ${config.watchPollIntervalMs}ms). Press Ctrl+C to stop.`);
  let running = true;
  process.on('SIGINT', () => {
    logger.info('Shutting down...');
    running = false;
  });

  while (running) {
    await waitUntilOnline(page);
    try {
      await scanUnreadChatsOnce(page, state);
      saveStateFn(state);
    } catch (err) {
      logger.error(`Watch loop iteration failed: ${err.message}`);
    }
    await sleep(config.watchPollIntervalMs);
  }
}
