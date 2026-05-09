/**
 * @file cleanupUnverifiedUsers.js — Scheduled cleanup job
 *
 * Removes ghost Firebase accounts from abandoned registrations:
 *   - emailVerified === false
 *   - Created more than 24 hours ago
 *   - No corresponding MongoDB User record (safety guard)
 *
 * WHY THIS EXISTS:
 *   After registration, Firebase creates a user immediately. If the user
 *   never verifies their email, this ghost account stays in Firebase forever.
 *   This job cleans them up hourly.
 *
 * SAFETY:
 *   Never deletes a Firebase user that has a MongoDB record.
 *   Logs summary counts only — never logs emails or UIDs.
 */

const { firebaseAdmin } = require('../config/firebase');
const User = require('../modules/users/users.model');
const logger = require('../shared/utils/logger');

/**
 * Clean up unverified Firebase accounts older than 24 hours
 * that have no corresponding MongoDB user.
 */
const cleanupUnverifiedUsers = async () => {
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - TWENTY_FOUR_HOURS_MS;
  let deletedCount = 0;
  let skippedCount = 0;
  let totalProcessed = 0;

  try {
    let nextPageToken;

    do {
      // List Firebase users (max 1000 per page)
      const listResult = await firebaseAdmin.auth().listUsers(1000, nextPageToken);

      for (const fbUser of listResult.users) {
        totalProcessed++;

        // Skip verified users
        if (fbUser.emailVerified) continue;

        // Skip recently created accounts (< 24 hours)
        const createdAt = new Date(fbUser.metadata.creationTime).getTime();
        if (createdAt > cutoff) continue;

        // Safety guard: check if MongoDB user exists
        const mongoUser = await User.findOne({ firebaseUid: fbUser.uid }).lean();
        if (mongoUser) {
          skippedCount++;
          continue;
        }

        // Delete the ghost Firebase account
        await firebaseAdmin.auth().deleteUser(fbUser.uid);
        deletedCount++;
      }

      nextPageToken = listResult.pageToken;
    } while (nextPageToken);

    logger.info(
      `Cleanup: processed ${totalProcessed} Firebase accounts. ` +
      `Deleted ${deletedCount} unverified ghosts. ` +
      `Skipped ${skippedCount} (had MongoDB records).`
    );
  } catch (error) {
    logger.error('Cleanup job error:', error.message);
    throw error;
  }
};

module.exports = { cleanupUnverifiedUsers };
