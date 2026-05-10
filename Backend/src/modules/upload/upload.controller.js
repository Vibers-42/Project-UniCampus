const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const uploadService = require('../../shared/uploadService');
const AppError = require('../../shared/utils/AppError');

const uploadFile = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  // Determine resource type based on mimetype
  let resourceType = 'auto';
  if (req.file.mimetype.startsWith('image/')) {
    resourceType = 'image';
  } else if (req.file.mimetype === 'application/pdf') {
    resourceType = 'raw'; // or 'image' if it's a PDF document to be previewed
  }

  // Pass buffer to uploadService
  // We use a generic 'uploads' folder, but could specify based on req.body.folder
  const folder = req.body.folder || 'general';
  const result = await uploadService.uploadFile(req.file.buffer, folder, resourceType);

  sendSuccess(res, { url: result.secure_url }, 'File uploaded successfully', 201);
});

module.exports = {
  uploadFile,
};
