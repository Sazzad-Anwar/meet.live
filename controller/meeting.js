//jshint esversion:10

const db = require('../config/db');

exports.meeting = async(req,res)=>{
    try {
        const {meeting_id} = req.params;

        let sql = "SELECT participant_name FROM participants WHERE room_id=? and status =?"
        let query = await db.db.query(sql,[meeting_id,'joined'],(err,details)=>{
            if(err) throw err;
            res.status(200).json(details);
        });

    } catch (error) {
        console.error(error);
    }
}

exports.room_create = async(req,res)=>{
    try {
        const {meeting_id,meeting_name,room_master_name,room_master_email}= req.body;

        let sql = 'INSERT INTO meeting (meeting_id,meeting_name,room_master_name,room_master_email,status) VALUES(?,?,?,?,?)'
        let query = await db.db.query(sql,[meeting_id,meeting_name,room_master_name,room_master_email,'open'],(err,done)=>{
            if(err) throw err;

            let ip = req.connection.remoteAddress;

            let sql ="INSERT INTO participants (participant_name,room_id,ip_address,status) VALUES(?,?,?,?)";
            let query = db.db.query(sql,[room_master_name,meeting_id,ip,'joined'],(err,done)=>{
                if(err) throw err;
                console.log(req.connection.remoteAddress);
                res.status(200).json({isSuccess:true,code:200,msg:'success'});
            });
        });

    } catch (error) {
        console.error(error);
    }
};


exports.participant_join = async (req,res)=>{
    try {
        const {name,meeting_id} = req.body;
        let ip = req.connection.remoteAddress;

        let sql = "SELECT * FROM participants WHERE participant_name=? and ip_address=? and room_id=?";
        let query = db.db.query(sql,[name,ip,meeting_id],(err,found)=>{
            if(err) throw err;
            if(found.length !== 0){
                let sql ="UPDATE participants SET status=? WHERE participant_name=? and room_id=?";
                let query = db.db.query(sql,['joined',name,meeting_id],(err,done)=>{
                    if(err) throw err;
                    console.log(done,'same name joined again');
                    res.status(200).json({isSuccess:true,code:200,msg:'success'});
                });
            }else{
                let sql ="INSERT INTO participants (participant_name,room_id,ip_address,status) VALUES(?,?,?,?)";
                let query = db.db.query(sql,[name,meeting_id,ip,'joined'],(err,done)=>{
                    if(err) throw err;
                    console.log(req.connection.remoteAddress);
                    res.status(200).json({isSuccess:true,code:200,msg:'success'});
                });
            }
        });

    } catch (error) {
        console.error(error);
    }
};


exports.leave = async(req,res)=>{
    try {
        
        const {session_name,room_id} = req.body;
        
        let currentTime = new Date();

        let sql = "SELECT * FROM meeting WHERE room_master_name = ? and meeting_id=?";
        let query = db.db.query(sql,[session_name,room_id],(err,found)=>{
            if(err) throw err;
            if(found.length !== 0){
                let sql = "UPDATE meeting SET meeting_closing_time=?, status=?";
                let query = db.db.query(sql,[currentTime,'closed'],(err,updated)=>{
                    if(err) throw err;
                    console.log(updated);
                    res.status(200).json({isSuccess:true,code:200,msg:'success'})
                });
            }else{
                let sql = "UPDATE participants SET status=? WHERE participant_name =?";
                let query = db.db.query(sql,['left',session_name],(err,updated)=>{
                    if(err) throw err;
                    console.log(updated);
                    res.status(200).json({isSuccess:true,code:200,msg:'success'})
                });
            }
        });
    } catch (error) {
        console.error(error);
    }
};


exports.participant_update= async(req,res)=>{
    try {
        const {meeting_id,name,participantID} = req.params;

        let sql = 'UPDATE participants SET participant_id=? WHERE participant_name=? and room_id=?';
        let query = db.db.query(sql,[participantID,name,meeting_id],(err,done)=>{
            if(err) throw err;
            res.status(200).json({isSuccess:true,code:200,msg:'success'})
        });

    } catch (error) {
        console.error(error);
    }
};

exports.participant_id = async(req,res)=>{
    try {
        const {meeting_id} = req.params;
        let sql = 'SELECT participant_name FROM participants WHERE room_id=?';
        let query = db.db.query(sql,meeting_id,(err,meeting)=>{
            if(err) throw err;
            res.status(202).json(meeting);
        });
    } catch (error) {
        console.error(error);
    }
};