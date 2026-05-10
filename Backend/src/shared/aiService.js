/**
 * @file aiService.js — Groq LLM Integration
 *
 * Uses the official groq-sdk (OpenAI-compatible API).
 * Model: llama-3.3-70b-versatile (fast, high quality, generous free tier)
 *
 * RETURN SHAPE:
 *   { success: true,  reply: string }
 *   { success: false, reply: string }
 *
 * USAGE:
 *   const { askAI } = require('../shared/aiService');
 *   const result = await askAI(systemPrompt, userMessage, history);
 */

const Groq = require('groq-sdk');
const logger = require('./utils/logger');
const { env } = require('../config');

// ── Startup diagnostic ──────────────────────────────────────
const _key = env.GROQ_API_KEY || '';
console.log('[aiService] Provider: Groq');
console.log('[aiService] GROQ_API_KEY:', _key ? `${_key.slice(0, 10)}... (loaded)` : 'MISSING!');

// ── Singleton Groq client ───────────────────────────────────
// Instantiated once on module load so the connection is reused.
let _groqClient = null;
const getGroq = () => {
  if (!_groqClient) {
    _groqClient = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return _groqClient;
};

/**
 * Send a message to Groq and return the reply.
 *
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {Array<{role:'user'|'assistant', content:string}>} history
 *   All saved messages for this conversation, including the just-saved current user msg.
 * @returns {Promise<{success:boolean, reply:string}>}
 */
const askAI = async (systemPrompt, userMessage, history = []) => {
  const apiKey = env.GROQ_API_KEY || '';

  if (!apiKey) {
    logger.error('[aiService] GROQ_API_KEY is not set');
    return { success: false, reply: 'AI not configured — GROQ_API_KEY missing in .env.' };
  }

  try {
    const reply = await callGroq(systemPrompt, userMessage, history);
    return { success: true, reply };
  } catch (err) {
    const msg = err?.message || '';
    logger.error('[aiService] Groq error:', msg);
    console.error('[aiService] Full Groq error:', err);

    if (msg.includes('429') || msg.includes('rate') || msg.includes('quota')) {
      return {
        success: false,
        reply: 'UniBot is busy right now — rate limit reached. Please wait a moment and try again.',
      };
    }
    if (msg.includes('401') || msg.includes('invalid_api_key') || msg.includes('Authentication')) {
      return {
        success: false,
        reply: 'AI configuration error — invalid API key. Please check GROQ_API_KEY.',
      };
    }

    return { success: false, reply: 'AI service encountered an error. Please try again.' };
  }
};

/**
 * Internal: Call Groq chat completions API.
 *
 * Groq uses the OpenAI chat format:
 *   { role: 'system' | 'user' | 'assistant', content: string }
 *
 * The history passed in includes the just-saved current user message as the
 * last entry — we exclude it and send it as the final user turn instead.
 */
const callGroq = async (systemPrompt, userMessage, history) => {
  console.log('[callGroq] Building messages...');

  // Exclude the last history entry (the current user msg — just saved to DB).
  // It becomes the final 'user' turn we explicitly pass.
  const priorTurns = history.slice(0, -1);

  const messages = [
    // System instruction
    { role: 'system', content: systemPrompt },
    // Prior conversation turns
    ...priorTurns.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
    // Current user message
    { role: 'user', content: userMessage },
  ];

  console.log('[callGroq] Sending to Groq, total turns:', messages.length);

  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  const reply = completion.choices[0]?.message?.content;

  if (!reply) throw new Error('Groq returned empty response');

  console.log('[callGroq] Success — reply length:', reply.length);
  return reply;
};

module.exports = { askAI };
