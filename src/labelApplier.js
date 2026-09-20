import { logger } from './logger.js';
import { SELECTORS } from './selectors.js';
import { config } from './config.js';
import { CATEGORIES } from './categories.js';

// Applies a WhatsApp Business "chat label" matching the classified category.
// Native WhatsApp only supports labeling at the chat level (not individual messages),
// so this labels the whole chat the message belongs to. Creates the label if it
// doesn't already exist yet.
export async function applyLabelToChat(page, chatRowLocator, categoryId) {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return;

  if (config.dryRun) {
    logger.info(`[dry-run] Would apply label "${category.label}" to chat.`);
    return;
  }

  try {
    await chatRowLocator.hover();
    const menuButton = chatRowLocator.locator(SELECTORS.chatMenuButton).first();
    await menuButton.click({ timeout: 5000 });

    const labelMenuItem = page.locator(SELECTORS.labelChatMenuItem).first();
    await labelMenuItem.click({ timeout: 5000 });

    const existingCheckbox = page.locator(SELECTORS.labelCheckboxByName(category.label)).first();
    if ((await existingCheckbox.count()) > 0) {
      await existingCheckbox.click();
    } else {
      const newLabelBtn = page.locator(SELECTORS.newLabelButton).first();
      await newLabelBtn.click({ timeout: 5000 });
      const input = page.locator(SELECTORS.labelNameInput).first();
      await input.fill(category.label);
      const saveBtn = page.locator(SELECTORS.labelSaveButton).first();
      await saveBtn.click();
    }

    const applyBtn = page.locator(SELECTORS.labelApplyButton).first();
    if ((await applyBtn.count()) > 0) await applyBtn.click();

    logger.info(`Applied label "${category.label}" to chat.`);
  } catch (err) {
    logger.error(
      `Failed to apply label "${category.label}" via UI (selectors may need updating - run "npm run check-selectors"): ${err.message}`
    );
  }
}
