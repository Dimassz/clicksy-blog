const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Rute untuk membuat artikel baru
router.post('/', postController.createPost);
router.get('/:slug', postController.getPostBySlug);

// Rute lain (GET, PUT, DELETE) akan ditambahkan di sini
// router.get('/', postController.getAllPosts);
// router.get('/:slug', postController.getPostBySlug);
// router.put('/:id', postController.updatePost);
// router.delete('/:id', postController.deletePost);

module.exports = router;