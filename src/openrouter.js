import { config } from './config.js';
import { CATEGORIES } from './categories.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// One representative example per category, mixing the languages this business
// actually receives messages in, used as few-shot examples below.
const FEW_SHOT_EXAMPLES = [
  { text: 'Please process the payment for invoice #1023, it has been 2 weeks.', category: 'supplier_pending_payment' },
  { text: 'Sebut harga sedang disediakan, akan hantar tidak lama lagi.', category: 'supplier_pending_quotation' },
  { text: '记得跟进林小姐的订单', category: 'internal_reply' },
  { text: 'Just a reminder to check on this again next week.', category: 'follow_up' },
  { text: 'Hi, do you have this in size L? Please let me know.', category: 'client_need_reply' },
  { text: '设计稿还在赶,预计明天完成。', category: 'supplier_pending_design' },
  { text: 'Let me check with my team and get back to you.', category: 'client_pending_reply' },
  { text: 'Saya akan buat pembayaran esok pagi.', category: 'client_pending_payment' },
  { text: 'Please send the design mockup so we can review it.', category: 'client_pending_design' },
  { text: 'Boleh beri sebut harga untuk 200 pcs baju?', category: 'client_pending_quotation' },
  { text: '请问可以发送这次订单的发票吗?', category: 'client_pending_invoice' },
  { text: 'We need your confirmation on the color choice by today.', category: 'supplier_need_reply' },
  { text: 'Will check with our team and update you soon.', category: 'supplier_pending_reply' },
  { text: 'Ada stock untuk warna biru saiz M?', category: 'client_pending_stock' },
  { text: '库存还在核实中,稍后通知你。', category: 'supplier_pending_stock' },
  { text: 'Hi, I saw your work online, interested in getting a quote for a new project.', category: 'new_job' },
];

function buildSystemPrompt() {
  const list = CATEGORIES.map((c) => `- ${c.id}: ${c.label} — ${c.description}`).join('\n');
  return [
    'You are a message classifier for WhatsApp chats.',
    'Classify the given message into exactly one of these categories:',
    list,
    '',
    'Messages may be written in English, Chinese, or Malay, or mix these languages in one message.',
    'Classify based on meaning regardless of language; always respond with the category id exactly as listed above (in English).',
    // Add extra rules/examples here, e.g.:
    // 'If a message mentions both payment and stock, prefer the payment category.',
    'Respond ONLY with strict JSON on a single line: {"category": "<one of the ids above>", "confidence": <0-1 number>}',
    'No extra text, no markdown, no explanation.',
  ].join('\n');
}

// Turns FEW_SHOT_EXAMPLES into alternating user/assistant messages the model can learn from.
function buildFewShotMessages() {
  return FEW_SHOT_EXAMPLES.flatMap(({ text, category }) => [
    { role: 'user', content: text },
    { role: 'assistant', content: JSON.stringify({ category, confidence: 1 }) },
  ]);
}

function parseClassification(raw) {
  const match = raw.match(/\{[\s\S]*\}/);
  const jsonStr = match ? match[0] : raw;
  try {
    const parsed = JSON.parse(jsonStr);
    const valid = CATEGORIES.find((c) => c.id === parsed.category)?.id;
    return {
      category: valid || 'other',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : null,
    };
  } catch {
    return { category: 'other', confidence: null };
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Sends message text to OpenRouter and returns { category, confidence }.
export async function classifyMessage(text, { retries = 2 } = {}) {
  if (!config.openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured (see .env.example)');
  }

  const body = {
    model: config.openRouterModel,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      ...buildFewShotMessages(),
      { role: 'user', content: (text || '(empty message)').slice(0, 2000) },
    ],
    temperature: 0,
  };


  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.siteUrl,
          'X-Title': config.siteName,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`OpenRouter HTTP ${res.status}: ${errText.slice(0, 300)}`);
      }

      const data = await res.json();
      const raw = data?.choices?.[0]?.message?.content?.trim() || '';
      return parseClassification(raw);
    } catch (err) {
      lastErr = err;
      if (attempt < retries) await sleep(500 * (attempt + 1));
    }
  }
  throw lastErr;
}
