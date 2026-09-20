import fs from 'node:fs';
import path from 'node:path';

const STATE_FILE = path.resolve('./data/state.json');

function ensureDir() {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function loadState() {
  ensureDir();
  if (!fs.existsSync(STATE_FILE)) return { processed: {} };
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return { processed: {} };
  }
}

export function saveState(state) {
  ensureDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function isProcessed(state, messageId) {
  return Boolean(state.processed[messageId]);
}

// Keeps only a short text snippet locally - avoid storing full message contents.
export function markProcessed(state, messageId, result) {
  state.processed[messageId] = { ...result, processedAt: new Date().toISOString() };
}
