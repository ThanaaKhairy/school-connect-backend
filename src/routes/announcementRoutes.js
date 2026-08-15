const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('admin', 'teacher'), announcementController.createAnnouncement);
router.get('/', authorize('admin', 'teacher', 'parent'), announcementController.getAllAnnouncements);
router.get('/:id', authorize('admin', 'teacher', 'parent'), announcementController.getAnnouncementById);
router.put('/:id', authorize('admin', 'teacher'), announcementController.updateAnnouncement);
router.delete('/:id', authorize('admin', 'teacher'), announcementController.deleteAnnouncement);

module.exports = router;
