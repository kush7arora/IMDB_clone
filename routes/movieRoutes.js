const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieControllers');

router.get('/:id/comments', movieController.getComments);
router.post('/:id/comments', movieController.postComment);

module.exports = router;
