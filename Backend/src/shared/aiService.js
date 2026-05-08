/**
 * @file aiService.js — LLM API Wrapper (Provider-Agnostic)
 *
 * SINGLE RESPONSIBILITY:
 *   Sends prompts to an LLM and returns the text response. The caller
 *   (aiChatbot module) has no idea which provider is being used.
 *
 * EXPORTS:
 *   askAI(systemPrompt, userMessage, conversationHistory)
 *
 * RETURN SHAPE:
 *   { success: true, reply: string }
 *   { success: false, reply: string }  (on error — reply contains error message)
 *
 * PROVIDER ROUTING:
 *   Checks env.LLM_PROVIDER to decide which API to call:
 *     'claude'  → Anthropic Claude API
 *     'gemini'  → Google Gemini API
 *
 *   Swapping providers = changing LLM_PROVIDER and LLM_API_KEY in .env.
 *   Nothing else in the app changes. Not a single import. Not a single line.
 *
 * USAGE:
 *   const { askAI } = require('../shared/aiService');
 *
 *   const result = await askAI(
 *     'You are a helpful university assistant.',
 *     'What events are happening this week?',
 *     [{ role: 'user', content: 'Hi' }, { role: 'assistant', content: 'Hello!' }]
 *   );
 *
 *   if (result.success) {
 *     console.log(result.reply);
 *   }
 */

const env = require('../config/env');
const logger = require('./utils/logger');

/**
 * Send a prompt to the configured LLM provider.
 *
 * @param {string} systemPrompt — System-level instructions for the LLM
 * @param {string} userMessage — The user's current message
 * @param {Array<{role: string, content: string}>} [conversationHistory=[]]
 *   Previous messages for context. Each entry: { role: 'user'|'assistant', content: string }
 * @returns {Promise<{success: boolean, reply: string}>}
 */
const askAI = async (systemPrompt, userMessage, conversationHistory = []) => {
  const provider = env.LLM_PROVIDER.toLowerCase();
  const apiKey = env.LLM_API_KEY;

  if (!provider || !apiKey) {
    return {
      success: false,
      reply: 'AI service is not configured. Set LLM_PROVIDER and LLM_API_KEY in .env.',
    };
  }

  logger.debug(`AI Service: sending prompt to "${provider}"`);

  try {
    switch (provider) {
      case 'claude':
        return await callClaude(apiKey, systemPrompt, userMessage, conversationHistory);
      case 'gemini':
        return await callGemini(apiKey, systemPrompt, userMessage, conversationHistory);
      default:
        return {
          success: false,
          reply: `Unsupported LLM provider: "${provider}". Supported: claude, gemini.`,
        };
    }
  } catch (error) {
    logger.error(`AI Service error (${provider}):`, error.message);
    return {
      success: false,
      reply: 'AI service encountered an error. Please try again later.',
    };
  }
};

// ──────────────────────────────────────────
// PROVIDER IMPLEMENTATIONS (internal only)
// ──────────────────────────────────────────

/**
 * Call Anthropic's Claude API.
 */
const callClaude = async (apiKey, systemPrompt, userMessage, history) => {
  // Build messages array: history + current user message
  const messages = [
    ...history.map((msg) => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    logger.error('Claude API error:', data);
    throw new Error(data.error?.message || 'Claude API call failed');
  }

  return { success: true, reply: data.content[0].text };
};

/**
 * Call Google's Gemini API.
 */
const callGemini = async (apiKey, systemPrompt, userMessage, history) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  // Build contents array with history + current message
  const contents = [
    ...history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    logger.error('Gemini API error:', data);
    throw new Error(data.error?.message || 'Gemini API call failed');
  }

  return { success: true, reply: data.candidates[0].content.parts[0].text };
};

module.exports = {
  askAI,
};
