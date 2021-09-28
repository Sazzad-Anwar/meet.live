const Users = require("../db/model");


const joinUser = async (username, socketId, roomId, isHost, email, isVideoMuted) => {

    let existsUser = await Users.findOne({
        $and: [
            { email }
        ]
    });

    if (existsUser) {
        existsUser.socketId = socketId ?? existsUser.socketId;
        existsUser.roomId = roomId ?? existsUser.roomId;
        existsUser.isHost = isHost ?? existsUser.isHost;
        existsUser.userName = username ?? existsUser.userName;
        existsUser.isVideoMuted = isVideoMuted ?? existsUser.isVideoMuted;

        let userUpdate = await existsUser.save();

        return userUpdate;

    } else {

        let newUser = new Users({
            userName: username,
            socketId,
            roomId,
            isHost,
            isJoined: true,
            email,
            isVideoMuted
        })

        user = await newUser.save();

        console.log('saved');

        return user;
    }

}

const getAllRoomUser = async (roomId) => {
    const allUser = await Users.find({ roomId });

    return allUser;
}

const toggleVideoStatus = async (socketId, toggleStatus) => {
    let user = await Users.findOneAndUpdate({ socketId }, { $set: { isVideoMuted: toggleStatus } })
    return user;
}

const stream = (socket) => {

    socket.on('subscribe', async (data) => {
        //subscribe/join a room
        socket.join(data.room);
        socket.join(data.socketId);

        await joinUser(data.username, data.socketId, data.room, data.isHost, data.email, data.isVideoMuted)

        //Inform other members in the room of new user's arrival
        socket.to(data.room).emit('new user', {
            socketId: data.socketId,
            username: data.username
        });
    });


    socket.on('newUserStart', async (data) => {
        socket.to(data.to).emit('newUserStart', { sender: data.sender });
    });


    socket.on('sdp', (data) => {
        socket.to(data.to).emit('sdp', { description: data.description, sender: data.sender });
    });


    socket.on('ice candidates', (data) => {
        socket.to(data.to).emit('ice candidates', { candidate: data.candidate, sender: data.sender });
    });


    socket.on('chat', (data) => {
        socket.to(data.room).emit('chat', { sender: data.sender, msg: data.msg });
    });

    // socket.on('disconnect', data => {
    //     console.log(data, 'socket disconnect');
    //     socket.to(data.room).emit('user-disconnected', { sender: data.sender });
    // })

    socket.on('participant', async (data) => {
        let getAllUser = await getAllRoomUser(data.room);
        socket.to(data.room).emit('participant', getAllUser);
    });

    socket.on('toggle-video', async (data) => {
        await toggleVideoStatus(data.socketId, data.status)
        socket.to(data.room).emit('toggle-video', { sender: data.sender, socketId: data.socketId, status: data.status });
    });

    socket.on('remove-person', async (data) => {

        socket.to(data.room).emit('remove-person', { socketId: data.socketId, email: data.userEmail });
    })

    socket.on('host-left-meeting', (data) => {
        console.log(data)
        socket.to(data.room).emit('host-left-meeting')
    })
};

module.exports = stream;
