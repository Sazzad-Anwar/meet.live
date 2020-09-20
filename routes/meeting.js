//jshint  esversion :10

const express = require('express');
const router = express.Router();
const meeting_details = require('../controller/meeting')

router.use(express.json());

//room creation with all details
router
    .route('/room_create')
    .post(meeting_details.room_create);


//fetch meeting all details
router
    .route('/participants/:meeting_id')
    .get(meeting_details.meeting)

//insert participant name and joining time in db
router
    .route('/participant/join')
    .post(meeting_details.participant_join);

router
    .route('/participant/update/:meeting_id/:name/:participantID')
    .post(meeting_details.participant_update);

//colsing the meeting session and updating the meeting closing time if the room master leaves
router
    .route('/leave')
    .post(meeting_details.leave);

router
    .route('/participant/id/:meeting_id')
    .get(meeting_details.participant_id)

module.exports = router;