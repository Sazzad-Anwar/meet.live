import h from './helpers.js';

window.addEventListener('load', () => {
    const room = h.getQString(location.href, 'room');
    const username = sessionStorage.getItem('username');
    const isHost = sessionStorage.getItem('isHost');
    const email = sessionStorage.getItem('email');
    let isAudioMuted = sessionStorage.getItem('audio-mute')
    let isVideoMuted = sessionStorage.getItem('video-mute')

    if (!room) {
        document.querySelector('#room-create').attributes.removeNamedItem('hidden');
    }

    else if (!username) {
        document.querySelector('#username-set').attributes.removeNamedItem('hidden');
    }

    else {
        let commElem = document.getElementsByClassName('room-comm');

        for (let i = 0; i < commElem.length; i++) {
            commElem[i].attributes.removeNamedItem('hidden');
            $('#footer a.hideOnMobile').attr('onclick', "leaveMeeting()");
            $('#footer a.hideOnMobile').attr('href', 'javascript:void(0)');
        }

        let pc = [];
        let users = [];

        let socket = io('/stream');

        var socketId = '';
        var randomNumber = `__${h.generateRandomString()}__${h.generateRandomString()}__`;
        var myStream = '';
        var screen = '';
        var recordedStream = [];
        var mediaRecorder = '';
        let remoteUserName = ''

        //Get user video by default
        getAndSetUserStream();


        socket.on('connect', () => {
            //set socketId
            socketId = socket.io.engine.id;
            // document.getElementById('randomNumber').innerText = randomNumber;


            socket.emit('subscribe', {
                room,
                socketId: socketId,
                username,
                isHost,
                email,
                isVideoMuted
            });


            socket.on('new user', (data) => {
                socket.emit('newUserStart', { to: data.socketId, sender: socketId, username, isHost, email, roomId: room });
                pc.push(data.socketId);

                init(true, data.socketId, data.username);
            });


            socket.on('newUserStart', (data) => {
                pc.push(data.sender);
                init(false, data.sender, data.username);
            });


            socket.on('ice candidates', async (data) => {
                data.candidate ? await pc[data.sender].addIceCandidate(new RTCIceCandidate(data.candidate)) : '';
            });


            socket.on('sdp', async (data) => {
                if (data.description.type === 'offer') {
                    data.description ? await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description)) : '';

                    h.getUserFullMedia().then(async (stream) => {
                        if (!document.getElementById('local').srcObject) {
                            h.setLocalStream(stream);
                        }

                        //save my stream
                        myStream = stream;

                        stream.getTracks().forEach((track) => {
                            pc[data.sender].addTrack(track, stream);
                        });

                        let answer = await pc[data.sender].createAnswer();

                        await pc[data.sender].setLocalDescription(answer);

                        socket.emit('sdp', { description: pc[data.sender].localDescription, to: data.sender, sender: socketId });
                    }).catch((e) => {
                        console.error(e);
                    });
                }

                else if (data.description.type === 'answer') {
                    await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description));
                }
            });


            socket.on('chat', (data) => {
                h.addChat(data, 'remote');
            });

            socket.on('participant', (data) => {
                users = data;
                h.participant(data, 'remote');
            });

            socket.on('toggle-video', (data) => {
                h.toggleVideo(data, 'remote');
            })

            socket.on("remove-person", data => {
                console.log(data);
                if (data.email === email) {
                    location.href = '/'
                }
            })
        });


        function getAndSetUserStream() {
            h.getUserFullMedia().then((stream) => {
                //save my stream
                myStream = stream;

                h.setLocalStream(stream);
            }).catch((e) => {
                console.error(`stream error: ${e}`);
            });
        }

        function removePerson(socketId) {
            let userEmail = (users.find(user => user.socketId === socketId)).email
            socket.emit("remove-person", { socketId, userEmail, room })
        }

        function addNewUserInList(name, id) {
            $('.name').append(`
                    <div class="d-flex my-1" id="${id}-userName">
                        <div class="col-8 text-truncate">
                            <p class="p-0 m-0" id="${id}-chatName">${name}</p>
                        </div>
                    </div>
                `)
        }

        function participantName(username) {
            let senderData = {
                room: room,
                sender: username || sessionStorage.getItem('username'),
                socketId: socketId
            };
            socket.emit('participant', senderData);
            // h.participant(senderData, 'local');
        }

        function videoMute(muted) {
            if (muted) {
                const data = {
                    room: room,
                    socketId: socketId,
                    sender: username,
                    status: 1
                }
                socket.on('toggle-video', (data) => {

                    h.toggleVideo(data);
                });
                h.toggleVideo(data, 'local')
                socket.emit('toggle-video', data)
            } else {
                const data = {
                    room: room,
                    socketId: socketId,
                    sender: username,
                    status: 0
                }
                socket.on('toggle-video', (data) => {
                    h.toggleVideo(data, 'local');
                });
                h.toggleVideo(data)
                socket.emit('toggle-video', data)
            }
        }

        function sendMsg(msg) {
            let data = {
                room: room,
                msg: msg,
                sender: `${username}`
            };

            //emit chat message
            socket.emit('chat', data);

            //add localchat
            h.addChat(data, 'local');
        }

        function init(createOffer, partnerName, username) {
            pc[partnerName] = new RTCPeerConnection(h.getIceServer());

            if (screen && screen.getTracks().length) {
                screen.getTracks().forEach((track) => {
                    pc[partnerName].addTrack(track, screen);//should trigger negotiationneeded event
                });
            }

            else if (myStream) {
                myStream.getTracks().forEach((track) => {
                    pc[partnerName].addTrack(track, myStream);//should trigger negotiationneeded event
                });
            }

            else {
                h.getUserFullMedia().then((stream) => {
                    //save my stream
                    myStream = stream;

                    stream.getTracks().forEach((track) => {
                        pc[partnerName].addTrack(track, stream);//should trigger negotiationneeded event
                    });

                    h.setLocalStream(stream);
                }).catch((e) => {
                    console.error(`stream error: ${e}`);
                });
            }



            //create offer
            if (createOffer) {
                pc[partnerName].onnegotiationneeded = async () => {
                    let offer = await pc[partnerName].createOffer();

                    await pc[partnerName].setLocalDescription(offer);

                    socket.emit('sdp', { description: pc[partnerName].localDescription, to: partnerName, sender: socketId });
                };
            }



            //send ice candidate to partnerNames
            pc[partnerName].onicecandidate = ({ candidate }) => {
                socket.emit('ice candidates', { candidate: candidate, to: partnerName, sender: socketId });
            };



            //add
            pc[partnerName].ontrack = (e) => {
                let str = e.streams[0];
                if (document.getElementById(`${partnerName}-video`)) {
                    document.getElementById(`${partnerName}-video`).srcObject = str;
                }

                else {

                    let remoteUserName = (users.find(user => user.socketId === partnerName))?.userName;

                    if (!remoteUserName) {
                        setTimeout(() => {
                            remoteUserName = (users.find(user => user.socketId === partnerName))?.userName;
                        }, 1000)
                        addUserVideo()
                    } else {
                        addUserVideo()
                    }

                    // users.map(user => {
                    //     if (user.isVideoMuted) {
                    //         loggedInAsVideoMuted(user.socketId)
                    //     }
                    //     if (user.isAudioMuted && email === user.email) {
                    //         loggedInAsVideoMuted(user.socketId, true)
                    //     }
                    // })

                    participantName(username);
                    addNewUserInList(remoteUserName, partnerName)
                    $('#totalUser').text(`(${$('.video').length - 1})`)

                    function addUserVideo() {
                        let remoteVideoDiv = document.createElement('div');
                        remoteVideoDiv.id = partnerName;
                        remoteVideoDiv.className = "video";
                        let remoteVideo = document.createElement('video');
                        remoteVideo.id = `${partnerName}-video`;
                        remoteVideo.srcObject = str;
                        remoteVideo.style.border = "2px solid #622c80"
                        remoteVideo.autoplay = true;
                        remoteVideo.className = 'remote-video';
                        let videoDetails = document.createElement('div');
                        videoDetails.className = 'video-details';
                        let videoDetailsName = document.createElement('p');
                        videoDetailsName.className = "p-0 m-0 text-white";
                        videoDetailsName.id = `${partnerName}-name`
                        videoDetailsName.innerText = remoteUserName;
                        let videoDetailsMic = document.createElement('i');
                        videoDetailsMic.className = "material-icons fs-7 hover-shadow text-white mute-remote-mic"
                        videoDetailsMic.innerText = "mic_none"
                        let videoDetailsZoom = document.createElement('i');
                        videoDetailsZoom.className = "material-icons fs-7 hover-shadow text-white expand-remote-video"
                        videoDetailsZoom.innerText = "crop_free"
                        let personRemove = document.createElement('i');
                        personRemove.className = `${partnerName} material-icons fs-7 hover-shadow text-white personRemove`
                        personRemove.innerText = "person_remove"

                        let staticView = document.createElement('div');
                        staticView.className = "static-view invisible";
                        staticView.id = `${partnerName}-static-view`;
                        let staticViewIcon = document.createElement('i');
                        staticViewIcon.className = "material-icons hover-shadow text-white";
                        staticViewIcon.innerText = "person_outline";
                        staticView.appendChild(staticViewIcon);

                        videoDetails.appendChild(videoDetailsName);
                        videoDetails.appendChild(videoDetailsMic);
                        videoDetails.appendChild(videoDetailsZoom);

                        if (isHost === 'true') {
                            videoDetails.appendChild(personRemove);
                        }

                        remoteVideoDiv.appendChild(remoteVideo);
                        remoteVideoDiv.appendChild(staticView);
                        remoteVideoDiv.appendChild(videoDetails);

                        //put div in main-section elem
                        // $('#videos').append(remoteVideo);
                        document.getElementById('videos').appendChild(remoteVideoDiv)
                        h.adjustVideoElemSize();
                    }
                }
            };



            pc[partnerName].onconnectionstatechange = (d) => {
                switch (pc[partnerName].iceConnectionState) {
                    case 'disconnected':

                    case 'failed':
                        h.closeVideo(partnerName);

                        break;

                    case 'closed':

                        h.closeVideo(partnerName);

                        break;
                }
            };



            pc[partnerName].onsignalingstatechange = (d) => {
                switch (pc[partnerName].signalingState) {
                    case 'closed':
                        h.closeVideo(partnerName);
                        break;
                }
            };
        }



        function shareScreen() {
            h.shareScreen().then((stream) => {
                h.toggleShareIcons(true);

                //disable the video toggle btns while sharing screen. This is to ensure clicking on the btn does not interfere with the screen sharing
                //It will be enabled was user stopped sharing screen
                h.toggleVideoBtnDisabled(true);

                //save my screen stream
                screen = stream;

                //share the new stream with all partners
                broadcastNewTracks(stream, 'video', false);

                //When the stop sharing button shown by the browser is clicked
                screen.getVideoTracks()[0].addEventListener('ended', () => {
                    stopSharingScreen();
                });
            }).catch((e) => {
                console.error(e);
            });
        }



        function stopSharingScreen() {
            //enable video toggle btn
            h.toggleVideoBtnDisabled(false);

            return new Promise((res, rej) => {
                screen.getTracks().length ? screen.getTracks().forEach(track => track.stop()) : '';

                res();
            }).then(() => {
                h.toggleShareIcons(false);
                broadcastNewTracks(myStream, 'video');
            }).catch((e) => {
                console.error(e);
            });
        }



        function broadcastNewTracks(stream, type, mirrorMode = true) {
            h.setLocalStream(stream, mirrorMode);

            let track = type == 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

            for (let p in pc) {
                let pName = pc[p];

                if (typeof pc[pName] == 'object') {
                    h.replaceTrack(track, pc[pName]);
                }
            }
        }


        function toggleRecordingIcons(isRecording) {
            let e = document.getElementById('record');

            if (isRecording) {
                e.setAttribute('title', 'Stop recording');
                e.children[0].classList.add('text-danger');
                e.children[0].classList.remove('text-white');
            }

            else {
                e.setAttribute('title', 'Record');
                e.children[0].classList.add('text-white');
                e.children[0].classList.remove('text-danger');
            }
        }


        function startRecording(stream) {
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            mediaRecorder.start(1000);
            toggleRecordingIcons(true);

            mediaRecorder.ondataavailable = function (e) {
                recordedStream.push(e.data);
            };

            mediaRecorder.onstop = function () {
                toggleRecordingIcons(false);

                h.saveRecordedStream(recordedStream, username);

                setTimeout(() => {
                    recordedStream = [];
                }, 3000);
            };

            mediaRecorder.onerror = function (e) {
                console.error(e);
            };
        }

        document.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('personRemove')) {
                let classes = $('.personRemove').attr("class");
                let socketId = classes.split(' ')[0]
                removePerson(socketId)
            }
        });


        //Chat textarea
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.which === 13 && (e.target.value.trim())) {
                e.preventDefault();

                sendMsg(e.target.value);

                setTimeout(() => {
                    e.target.value = '';
                }, 50);
            }
        });

        if (isVideoMuted === 'true') {
            setTimeout(() => {
                document.getElementById('toggle-video').click()
            }, 2000)
        }

        if (isAudioMuted === 'true') {
            setTimeout(() => {
                document.getElementById('toggle-mute').click()
            }, 2000)
        }

        //When the video icon is clicked
        document.getElementById('toggle-video').addEventListener('click', (e) => {
            e.preventDefault();

            if (myStream.getVideoTracks()[0].enabled) {
                // e.target.classList.remove('fa-video');
                // e.target.classList.add('fa-video-slash');
                $('#toggle-video .hover-scale i').text('videocam_off');
                videoMute(true)
                sessionStorage.setItem('video-mute', true)
                myStream.getVideoTracks()[0].enabled = false;
            }

            else {
                // e.target.classList.remove('fa-video-slash');
                // e.target.classList.add('fa-video');
                $('#toggle-video .hover-scale i').text('videocam');
                sessionStorage.setItem('video-mute', false)
                videoMute(false)
                myStream.getVideoTracks()[0].enabled = true;
            }

            broadcastNewTracks(myStream, 'video');

        });


        //When the mute icon is clicked
        document.getElementById('toggle-mute').addEventListener('click', (e) => {
            e.preventDefault();

            if (myStream.getAudioTracks()[0].enabled) {
                // e.target.classList.remove('fa-microphone-alt');
                // e.target.classList.add('fa-microphone-alt-slash');
                $('#toggle-mute .hover-scale i').text('mic_off');
                sessionStorage.setItem('audio-mute', true)
                myStream.getAudioTracks()[0].enabled = false;
            }

            else {
                // e.target.classList.remove('fa-microphone-alt-slash');
                // e.target.classList.add('fa-microphone-alt');
                $('#toggle-mute .hover-scale i').text('mic_none');
                sessionStorage.setItem('audio-mute', false)
                myStream.getAudioTracks()[0].enabled = true;
            }

            broadcastNewTracks(myStream, 'audio');
        });


        //When user clicks the 'Share screen' button
        document.getElementById('share-screen').addEventListener('click', (e) => {
            e.preventDefault();

            if (screen && screen.getVideoTracks().length && screen.getVideoTracks()[0].readyState != 'ended') {
                stopSharingScreen();
            }

            else {
                shareScreen();
            }
        });


        //When record button is clicked
        // document.getElementById('record').addEventListener('click', (e) => {
        //     /**
        //      * Ask user what they want to record.
        //      * Get the stream based on selection and start recording
        //      */
        //     if (!mediaRecorder || mediaRecorder.state == 'inactive') {
        //         h.toggleModal('recording-options-modal', true);
        //     }

        //     else if (mediaRecorder.state == 'paused') {
        //         mediaRecorder.resume();
        //     }

        //     else if (mediaRecorder.state == 'recording') {
        //         mediaRecorder.stop();
        //     }
        // });


        //When user choose to record screen
        // document.getElementById('record-screen').addEventListener('click', () => {
        //     h.toggleModal('recording-options-modal', false);

        //     if (screen && screen.getVideoTracks().length) {
        //         startRecording(screen);
        //     }

        //     else {
        //         h.shareScreen().then((screenStream) => {
        //             startRecording(screenStream);
        //         }).catch(() => { });
        //     }
        // });


        //When user choose to record own video
        // document.getElementById('record-video').addEventListener('click', () => {
        //     h.toggleModal('recording-options-modal', false);

        //     if (myStream && myStream.getTracks().length) {
        //         startRecording(myStream);
        //     }

        //     else {
        //         h.getUserFullMedia().then((videoStream) => {
        //             startRecording(videoStream);
        //         }).catch(() => { });
        //     }
        // });

        // console.log(users, 'users');
    }
});
