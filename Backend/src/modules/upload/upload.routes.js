const { Router } = require('express');
const ctrl = require('./upload.controller');
const upload = require('../../middleware/upload.middleware');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

router.use(protect);

router.post('/', upload.single('file'), ctrl.uploadFile);

module.exports = router;
