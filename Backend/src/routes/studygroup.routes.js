const { Router } = require('express');
const multer = require('multer');
const ctrl = require('../controllers/studygroup.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// All routes are protected
router.use(protect);

// Groups
router.get('/', ctrl.getGroups);
router.post('/', ctrl.createGroup);
router.get('/:id', ctrl.getGroupById);
router.patch('/:id', ctrl.updateGroup);
router.delete('/:id', ctrl.deleteGroup);
router.post('/:id/join', ctrl.joinGroup);
router.post('/:id/leave', ctrl.leaveGroup);
router.post('/:id/pin-resource', ctrl.pinResource);
router.delete('/:id/pin-resource/:resourceId', ctrl.unpinResource);

// Members
router.get('/:id/members', ctrl.getMembers);
router.delete('/:id/members/:userId', ctrl.kickMember);

// Threads
router.get('/:id/threads', ctrl.getThreads);
router.post('/:id/threads', ctrl.createThread);
router.patch('/:id/threads/:threadId', ctrl.togglePinThread);
router.delete('/:id/threads/:threadId', ctrl.deleteThread);

// Messages
router.get('/:id/messages', ctrl.getMessages);
router.post('/:id/messages', upload.single('attachment'), ctrl.sendMessage);
router.delete('/:id/messages/:messageId', ctrl.deleteMessage);
router.post('/:id/messages/read', ctrl.markRead);

module.exports = router;
