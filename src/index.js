import fs from 'node:fs';
import { launchWhatsAppSession } from './browserSession.js';
import { loadState, saveState } from './messageStore.js';
import { scanUnreadChatsOnce } from './scanner.js';
import { watchLoop } from './watcher.js';
import { logger } from './logger.js';

const args = process.argv.slice(2);
const once = args.includes('--once');
const dumpDom = args.includes('--dump-dom');

async function main() {
  const { context, page } = await launchWhatsAppSession();
  const state = loadState();

  if (dumpDom) {
    const html = await page.content();
    fs.mkdirSync('./data', { recursive: true });
    fs.writeFileSync('./data/dom-dump.html', html);
    logger.info('Dumped current page DOM to ./data/dom-dump.html for selector debugging.');
    await context.close();
    return;
  }

  if (once) {
    await scanUnreadChatsOnce(page, state);
    saveState(state);
    await context.close();
    return;
  }

  await watchLoop(page, state, saveState);
  await context.close();
}

main().catch((err) => {
  logger.error('Fatal error:', err);
  process.exit(1);
});
