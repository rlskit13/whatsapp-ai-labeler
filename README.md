# WhatsApp AI Labeler

Automates WhatsApp Web (Chrome, via Playwright) to classify incoming messages with an AI
model called through **OpenRouter**, then applies a matching **WhatsApp Business "chat
label"** through the UI.

> ⚠️ **Read before using**
> - This drives the unofficial WhatsApp Web UI, not an approved API. It violates
>   WhatsApp's Terms of Service, and WhatsApp can flag/limit/ban accounts that use
>   automation tools like this. Use at your own risk, ideally on a secondary/test account.
> - WhatsApp only supports labels **on WhatsApp Business**, and only at the **chat level**
>   (not per individual message). This tool classifies each message, logs the result
>   locally (`data/state.json`), and applies the label to the *chat* the message is in.
>   There is no way to visually tag a single message with a color/label inside WhatsApp
>   itself on a personal or business account.
> - WhatsApp's web DOM changes often and isn't documented. Selectors in
>   [src/selectors.js](src/selectors.js) are best-effort and may need updating — see
>   Troubleshooting below.

## Setup

```powershell
npm install
npx playwright install chromium
copy .env.example .env
# edit .env and set OPENROUTER_API_KEY (get one at https://openrouter.ai/keys)
```

## Usage

First run opens a visible Chrome window showing a QR code — scan it with WhatsApp on your
phone (Settings > Linked devices > Link a device). The session is then persisted in
`.wwebjs_session/`, so you won't need to scan again on later runs unless you log out.

```powershell
# Live mode: keeps running, polls for new/unread messages, Ctrl+C to stop
npm start

# Batch mode: scans currently unread chats once, classifies, labels, exits
npm run once

# Debug: dumps the live page HTML to data/dom-dump.html to help fix selectors
npm run check-selectors
```

Set `DRY_RUN=true` in `.env` to classify and log without touching any WhatsApp UI —
useful when testing a new prompt/category set safely.

## Categories

Edit [src/categories.js](src/categories.js) — it currently mirrors the 16 labels already
set up in your WhatsApp Business account (Client/Supplier reply, payment, design,
quotation, invoice, and stock states, plus Internal reply, Follow up, and new job).
`id` is what's sent to the model; `label` must match the existing WhatsApp label text
exactly (including casing) so the tool checks the existing label instead of creating a
duplicate. A few labels were truncated in the screenshot they were copied from (e.g.
"Pending Quot...") — double check those exact strings against your real WhatsApp labels
list and fix any mismatches in `categories.js`.

## How it works

- `src/browserSession.js` launches a persistent Chrome profile, waits for either the QR
  code (not logged in) or the chat list (logged in), and detects the "phone not
  connected" banner to pause processing until connectivity returns.
- `src/scanner.js` reads unread chats and their most recent messages from the DOM.
- `src/openrouter.js` sends message text to your configured OpenRouter model and expects
  strict JSON back (`{"category": "...", "confidence": 0-1}`).
- `src/labelApplier.js` opens a chat's menu, applies (creating if needed) a WhatsApp
  label matching the classified category.
- `src/messageStore.js` keeps a local JSON dedupe log (`data/state.json`) so messages
  aren't reclassified on restart. Only a short text snippet is stored, not full message
  history.

## Troubleshooting

- **Nothing gets labeled / clicks fail**: WhatsApp changed its DOM. Run
  `npm run check-selectors`, open `data/dom-dump.html`, find the new attributes/classes
  for the chat menu, "Label chat" item, and label checkboxes, and update
  [src/selectors.js](src/selectors.js).
- **Labels feature missing**: confirm the linked account is a WhatsApp **Business**
  account — labels don't exist on personal accounts.
- **Stuck on QR code**: make sure the phone has an active internet connection and
  WhatsApp is up to date.
- **Rate limits/costs**: pick a cheaper/faster model via `OPENROUTER_MODEL` in `.env`
  (e.g. a `:free` suffixed model on OpenRouter) if you're processing high message volume.
