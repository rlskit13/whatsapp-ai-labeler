// NOTE: WhatsApp Web's DOM/CSS classes are not officially documented and change over time
// (Meta ships frequent front-end updates). These selectors are best-effort, based on
// commonly observed attributes. If labeling/scanning stops working, run:
//   npm run check-selectors
// which dumps the live page HTML to ./data/dom-dump.html so you can inspect and fix
// the selectors below without touching any other code.
export const SELECTORS = {
  qrCode: 'canvas[aria-label], div[data-ref] canvas',
  chatListPane: '#pane-side',
  offlineBanner: '[data-testid="alert-phone-not-connected"], *:has-text("Computer not connected to phone")',
  unreadChatRow: '#pane-side div[role="row"]:has(span[aria-label*="unread message"])',
  chatRow: '#pane-side div[role="row"]',
  chatTitle: 'span[dir="auto"][title]',
  conversationPanel: '#main',
  messageRowIncoming: 'div.message-in',
  messageText: 'span.selectable-text span',
  chatMenuButton: '[data-testid="menu"], div[title="Menu"], button[aria-label="Menu"]',
  labelChatMenuItem: 'li:has-text("Label chat"), div[role="button"]:has-text("Label chat")',
  newLabelButton: 'div:has-text("New label"), button:has-text("New label")',
  labelNameInput: 'div[contenteditable="true"][data-tab]',
  labelSaveButton: 'div[role="button"]:has-text("Save"), button:has-text("Save")',
  labelApplyButton: 'div[role="button"]:has-text("Apply"), button:has-text("Apply")',
  labelCheckboxByName: (name) =>
    `li:has-text("${name}") input[type="checkbox"], div[role="checkbox"]:has-text("${name}")`,
};
