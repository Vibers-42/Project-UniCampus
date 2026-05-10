const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./feed.service');

const createPost = catchAsync(async (req, res) => {
  const post = await svc.createPost(req.body, req.user._id);
  sendSuccess(res, post, 'Post created successfully', 201);
});

const getFeed = catchAsync(async (req, res) => {
  const result = await svc.getFeed(req.query, req.user._id);
  sendSuccess(res, result, 'Feed fetched successfully');
});

const getPost = catchAsync(async (req, res) => {
  const post = await svc.getPost(req.params.id, req.user._id);
  sendSuccess(res, post, 'Post fetched successfully');
});

const likePost = catchAsync(async (req, res) => {
  const result = await svc.likePost(req.params.id, req.user._id);
  sendSuccess(res, result, 'Post like toggled successfully');
});

const addComment = catchAsync(async (req, res) => {
  const comment = await svc.addComment(req.params.id, req.user._id, req.body.content);
  sendSuccess(res, comment, 'Comment added successfully', 201);
});

const getComments = catchAsync(async (req, res) => {
  const result = await svc.getComments(req.params.id, req.query);
  sendSuccess(res, result, 'Comments fetched successfully');
});

module.exports = {
  createPost,
  getFeed,
  getPost,
  likePost,
  addComment,
  getComments
};
