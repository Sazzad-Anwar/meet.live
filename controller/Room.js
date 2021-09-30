const Users = require('../db/model');

const findRoomHost = async (req, res) => {
    try {
        const { room } = req.body;
        const user = await Users.findOne({ room, isHost: true });
        if (user) {
            res.json({
                isSuccess: true,
                status: 'success',
                code: 200,
                data: {
                    hostFound: true
                }
            })
        } else {
            res.status(404).json({
                isSuccess: false,
                status: 'failed',
                code: 404,
                data: {
                    hostFound: false
                }
            })
        }

    } catch (error) {
        console.log(error);
    }
}

const resetUserRoomDetails = async (req, res) => {
    try {
        const { email } = req.body;

        let user = await Users.findOne({ email });

        if (user) {
            user.isHost = false;
            user.roomId = '';
            user.socketId = '';
            user.isJoined = false;
            user.isLeft = true;
            user.isVideoMuted = false;

            let userUpdated = await user.save();

            res.json({
                isSuccess: true,
                status: 'success',
                code: 200,
                data: {
                    user: userUpdated
                }
            })
        } else {
            res.status(404).json({
                isSuccess: false,
                status: 'failed',
                code: 404,
                message: "User is not found"
            })
        }


    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    findRoomHost,
    resetUserRoomDetails
}