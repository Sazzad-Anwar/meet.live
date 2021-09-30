const { findRoomHost, resetUserRoomDetails } = require('../controller/Room');

const router = require('express').Router();

router
    .route('/findHost')
    .get(findRoomHost)


router
    .route('/resetUserRoomDetails')
    .post(resetUserRoomDetails)

module.exports = router;