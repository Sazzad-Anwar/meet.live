//jshint esversion:10

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const passport =require('passport');

exports.adminLogin = async(req,res)=>{
    try {
        await res.render('adminLogin');
    } catch (error) {
        console.error(error);
    }
}

exports.adminLoginPost = ((req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin',
        failureFlash: true
    })(req, res, next);
});


exports.dashboard = async(req,res)=>{
    try {

        let query = await db.db.query('SELECT * FROM meeting ORDER BY id DESC',(err,meetings)=>{
            if(err) throw err;
            let query = db.db.query('SELECT * FROM participants',(err,participants)=>{
                if(err) throw err;

                let query = db.db.query('SELECT  meeting_id,TIMEDIFF(meeting_closing_time,room_creation_time) AS duration FROM meeting WHERE status=?','closed',(err,duration)=>{
                    if(err) throw err;

                    let runningMeeting = meetings.filter(meeting=> meeting.status ==='open')
                    
                    res.render('dashboard',{totalMeeting:meetings.length,runningMeeting:runningMeeting.length,meetings,participants,duration});
                })
            });
        });

    } catch (error) {
        console.error(error);
    }
}

exports.logout = async (req, res) => {
    try {
        req.logout();
        res.redirect("/admin");
    } catch (error) {
        console.error(error);
    }
};