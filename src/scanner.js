import { logger } from './logger.js';
import { SELECTORS } from './selectors.js';
import { classifyMessage } from './openrouter.js';
import { applyLabelToChat } from './labelApplier.js';
import { isProcessed, markProcessed } from './messageStore.js';

// One pass over currently unread chats: opens each, classifies its most recent
// unseen incoming messages, records the result locally, and (unless DRY_RUN)
// applies a matching WhatsApp label to the chat.
export async function scanUnreadChatsOnce(page, state) {
  const unreadRows = page.locator(SELECTORS.unreadChatRow);
  const count = await unreadRows.count();
  if (count > 0) logger.info(`Found ${count} unread chat(s).`);

  for (let i = 0; i < count; i++) {
    // Re-query each iteration: clicking a chat can reorder/re-render the list.
    const row = page.locator(SELECTORS.unreadChatRow).nth(0);
    if ((await row.count()) === 0) break;

    const chatTitle = await row
      .locator(SELECTORS.chatTitle)
      .first()
      .innerText()
      .catch(() => 'Unknown chat');

    await row.click().catch(() => {});
    await page.waitForTimeout(1000);

    const messages = page.locator(`${SELECTORS.conversationPanel} ${SELECTORS.messageRowIncoming}`);
    const msgCount = await messages.count();
    const lastFew = Math.min(msgCount, 5);

    for (let j = msgCount - lastFew; j < msgCount; j++) {
      const msgEl = messages.nth(j);
      const id = (await msgEl.getAttribute('data-id')) || `${chatTitle}-${j}`;
      if (isProcessed(state, id)) continue;

      const text = await msgEl
        .locator(SELECTORS.messageText)
        .allInnerTexts()
        .then((t) => t.join(' '))
        .catch(() => '');
      if (!text) continue;

      try {
        const result = await classifyMessage(text);
        logger.info(`Chat "${chatTitle}" message classified as: ${result.category}`);
        markProcessed(state, id, { chat: chatTitle, category: result.category, snippet: text.slice(0, 200) });
        await applyLabelToChat(page, row, result.category);
      } catch (err) {
        logger.error(`Classification failed for chat "${chatTitle}": ${err.message}`);
      }
    }
  }
}
