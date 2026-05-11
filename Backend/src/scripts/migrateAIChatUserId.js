/**
 * @file migrateAIChatUserId.js
 * @description One-time migration: converts AIConversation.userId from email
 *              strings to MongoDB ObjectId references (ref: 'User').
 *
 * Run ONCE after deploying the updated aiChatbot.model.js:
 *   node src/scripts/migrateAIChatUserId.js
 *
 * Safe to re-run — already-migrated documents (where userId is ObjectId)
 * are skipped automatically.
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');

// ── Inline minimal schemas (avoids circular dependency with model files) ──────
const userSchema = new mongoose.Schema({ email: String, firebaseUid: String });
const convSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.Mixed, title: String }, { strict: false });

const User            = mongoose.model('User', userSchema);
const AIConversation  = mongoose.model('AIConversation', convSchema);

async function migrate() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ Connected.\n');

  // Fetch all conversations where userId is still a string (email format)
  const all = await AIConversation.find({}).lean();
  const emailConvs = all.filter(c => typeof c.userId === 'string' && c.userId.includes('@'));

  console.log(`Found ${all.length} total conversations.`);
  console.log(`Found ${emailConvs.length} conversations with email-based userId to migrate.\n`);

  if (emailConvs.length === 0) {
    console.log('✅ Nothing to migrate. Exiting.');
    await mongoose.disconnect();
    return;
  }

  // Build a unique list of emails to resolve in one DB round-trip
  const emails = [...new Set(emailConvs.map(c => c.userId))];
  const users  = await User.find({ email: { $in: emails } }).lean();
  const emailToId = {};
  users.forEach(u => { emailToId[u.email] = u._id; });

  let migrated = 0;
  let skipped  = 0;

  for (const conv of emailConvs) {
    const objectId = emailToId[conv.userId];
    if (!objectId) {
      console.warn(`  ⚠ No User found for email "${conv.userId}" (conv ${conv._id}) — skipping.`);
      skipped++;
      continue;
    }
    await AIConversation.updateOne({ _id: conv._id }, { $set: { userId: objectId } });
    migrated++;
    console.log(`  ✔ Migrated conv ${conv._id} | ${conv.userId} → ${objectId}`);
  }

  console.log(`\n✅ Migration complete.`);
  console.log(`   Migrated : ${migrated}`);
  console.log(`   Skipped  : ${skipped}`);

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
