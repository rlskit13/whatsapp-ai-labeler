import 'dotenv/config';

export const config = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  openRouterModel: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
  siteUrl: process.env.OPENROUTER_SITE_URL || 'http://localhost',
  siteName: process.env.OPENROUTER_SITE_NAME || 'WhatsApp AI Labeler',
  userDataDir: process.env.WHATSAPP_USER_DATA_DIR || './.wwebjs_session',
  watchPollIntervalMs: Number(process.env.WATCH_POLL_INTERVAL_MS || 4000),
  dryRun: process.env.DRY_RUN === 'true',
};

if (!config.openRouterApiKey) {
  // Classification will throw at call time; warn early so it's obvious why.
  console.warn('[config] OPENROUTER_API_KEY is not set. Copy .env.example to .env and add your key.');
}
