export default {
    generateRandomString() {
        const crypto = window.crypto || window.msCrypto;
        let array = new Uint32Array(1);

        return crypto.getRandomValues(array);
    },


    closeVideo(elemId) {
        if (document.getElementById(elemId)) {
            document.getElementById(elemId).remove();
            document.getElementById(`${elemId}-userName`).remove();
            $('#totalUser').text(`(${$('.video').length - 1})`)
            if (window.innerWidth < 768) {
                $('.mobileHeader').text(`Joined ${$('.video').length - 1}`)
                $('.mobileHeader').addClass('badge bg-danger')
            }
            this.adjustVideoElemSize();
        }
    },


    pageHasFocus() {
        return !(document.hidden || document.onfocusout || window.onpagehide || window.onblur);
    },


    getQString(url = '', keyToReturn = '') {
        url = url ? url : location.href;
        let queryStrings = decodeURIComponent(url).split('#', 2)[0].split('?', 2)[1];

        if (queryStrings) {
            let splittedQStrings = queryStrings.split('&');

            if (splittedQStrings.length) {
                let queryStringObj = {};

                splittedQStrings.forEach(function (keyValuePair) {
                    let keyValue = keyValuePair.split('=', 2);

                    if (keyValue.length) {
                        queryStringObj[keyValue[0]] = keyValue[1];
                    }
                });

                return keyToReturn ? (queryStringObj[keyToReturn] ? queryStringObj[keyToReturn] : null) : queryStringObj;
            }

            return null;
        }

        return null;
    },


    userMediaAvailable() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    },


    getUserFullMedia() {
        if (this.userMediaAvailable()) {
            return navigator.mediaDevices.getUserMedia({
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
        }

        else {
            throw new Error('User media not available');
        }
    },


    getUserAudio() {
        if (this.userMediaAvailable()) {
            return navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
        }

        else {
            throw new Error('User media not available');
        }
    },



    shareScreen() {
        if (this.userMediaAvailable()) {
            return navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always"
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
        }

        else {
            throw new Error('User media not available');
        }
    },


    getIceServer() {
        return {
            iceServers: [
                {
                    urls: ["stun:stun.speakez.chat"]
                },
                {
                    username: "sez",
                    credential: "Qbb8ccQxBrV5VL8R",
                    urls: [
                        "turn:turn.speakez.chat:3478?transport=udp",
                        "turn:turn.speakez.chat:3478?transport=tcp"
                    ]
                }
            ]
        };
    },

    toggleVideo(data, type) {
        if (type === 'remote') {
            if (data.status === 1) {
                $(`#${data.socketId}-static-view`).removeClass('invisible')
                $(`#${data.socketId}-static-view`).addClass('visible')
            }
            else {
                $(`#${data.socketId}-static-view`).addClass('invisible')
                $(`#${data.socketId}-static-view`).removeClass('visible')
            }

        } else {
            if (data.status === 1) {
                $(`#local-static-view`).removeClass('invisible')
                $(`#local-static-view`).addClass('visible')
            }
            else {
                $(`#local-static-view`).addClass('invisible')
                $(`#local-static-view`).removeClass('visible')
            }
        }
    },

    addChat(data, senderType) {
        let chatMsgDiv = document.querySelector('#chat-messages');
        let contentAlign = 'justify-content-end';
        let senderName = 'You';
        let msgBg = 'bg-white';

        if (senderType === 'remote') {
            contentAlign = 'justify-content-start';
            senderName = data.sender;
            msgBg = '';

            // this.toggleChatNotificationBadge();
        }

        let chatDiv = document.createElement('div');
        let info = document.createElement('p');
        let chatText = document.createElement('p');
        chatDiv.className = 'message-text-sender';
        info.className = 'p-0 m-0'
        chatText.className = "message-text";
        info.innerText = `@${senderName} | ${moment().format('Do MMM, YY h:mm a')}`;
        chatText.innerText = xssFilters.inHTMLData(data.msg).autoLink({ target: "_blank", rel: "nofollow" });
        chatDiv.appendChild(info);
        chatDiv.appendChild(chatText);
        // let colDiv = document.createElement('div');
        // colDiv.className = `col-10 card chat-card msg ${msgBg}`;
        // colDiv.innerHTML = xssFilters.inHTMLData(data.msg).autoLink({ target: "_blank", rel: "nofollow" });

        // let rowDiv = document.createElement('div');
        // rowDiv.className = `row ${contentAlign} mb-2`;


        // colDiv.appendChild(infoDiv);
        // rowDiv.appendChild(colDiv);

        chatMsgDiv.appendChild(chatDiv);

        /**
         * Move focus to the newly added message but only if:
         * 1. Page has focus
         * 2. User has not moved scrollbar upward. This is to prevent moving the scroll position if user is reading previous messages.
         */
        // if (this.pageHasFocus) {
        //     chatDiv.scrollIntoView();
        // }
    },


    // toggleChatNotificationBadge() {
    //     if (document.querySelector('#chat-pane').classList.contains('chat-opened')) {
    //         document.querySelector('#new-chat-notification').setAttribute('hidden', true);
    //     }

    //     else {
    //         document.querySelector('#new-chat-notification').removeAttribute('hidden');
    //     }
    // },



    replaceTrack(stream, recipientPeer) {
        let sender = recipientPeer.getSenders ? recipientPeer.getSenders().find(s => s.track && s.track.kind === stream.kind) : false;

        sender ? sender.replaceTrack(stream) : '';
    },



    toggleShareIcons(share) {

        if (share) {
            $('#share-screen i').text('cast')
            $('#share-screen i .hover-scale').addClass('icon-active')
            $('#share-screen p').text('Screen is sharing')
        }

        else {
            $('#share-screen i').text('filter_none')
            $('#share-screen i .hover-scale').removeClass('icon-active')
            $('#share-screen p').text('Share screen')
        }
    },


    toggleVideoBtnDisabled(disabled) {
        document.getElementById('toggle-video').disabled = disabled;
    },


    maximiseStream(e) {
        let elem = (e.target.parentElement.parentElement.children[0]);
        console.log(elem);
        elem.requestFullscreen() || elem.mozRequestFullScreen() || elem.webkitRequestFullscreen() || elem.msRequestFullscreen();
    },


    singleStreamToggleMute(e) {
        if (e.target.classList.contains('fa-microphone')) {
            let elem = (e.target.parentElement.parentElement.children[0]);
            elem.muted = true;
            e.target.classList.remove('fa-microphone');
            e.target.innerText = 'mic_off'
        }

        else {
            let id = (e.target.parentElement.children[0].id).split('-')[0];
            let elem = (e.target.parentElement.parentElement.children[0]);
            elem.muted = false;
            e.target.classList.add('fa-microphone');
            e.target.innerText = 'mic_none'
        }
    },


    saveRecordedStream(stream, user) {
        let blob = new Blob(stream, { type: 'video/webm' });

        let file = new File([blob], `${user}-${moment().unix()}-record.webm`);

        saveAs(file);
    },


    toggleModal(id, show) {
        let el = document.getElementById(id);

        if (show) {
            el.style.display = 'block';
            el.removeAttribute('aria-hidden');
        }

        else {
            el.style.display = 'none';
            el.setAttribute('aria-hidden', true);
        }
    },



    setLocalStream(stream, mirrorMode = true) {
        const localVidElem = document.getElementById('local');

        localVidElem.srcObject = stream;
        mirrorMode ? localVidElem.classList.add('mirror-mode') : localVidElem.classList.remove('mirror-mode');
    },


    adjustVideoElemSize() {
        let elem = $('.video');
        let totalRemoteVideosDesktop = elem.length;
        let videoHeight = $('.video-portion').outerHeight();
        if (window.innerWidth < 768) {
            let newWidth = totalRemoteVideosDesktop <= 2 ? '100%' : '50%';
            for (let i = 0; i < totalRemoteVideosDesktop; i++) {
                elem[i].style.width = newWidth;
                $('.video video')[i].style.width = "100%";
                $('.video video')[i].style.height = "inherit";
                if (totalRemoteVideosDesktop <= 2) {
                    $('.video')[i].style.height = (videoHeight / 2) + "px"
                } else {
                    $('.video')[i].style.height = "auto";
                }
            }


        } else {

            let newWidth = totalRemoteVideosDesktop <= 2 ? '50%' : (
                totalRemoteVideosDesktop <= 3 ? '33.33%' : (
                    totalRemoteVideosDesktop <= 8 ? '25%' : (
                        totalRemoteVideosDesktop <= 15 ? '20%' : (
                            totalRemoteVideosDesktop <= 18 ? '16%' : (
                                totalRemoteVideosDesktop <= 23 ? '15%' : (
                                    totalRemoteVideosDesktop <= 32 ? '12%' : '10%'
                                )
                            )
                        )
                    )
                )
            );

            for (let i = 0; i < totalRemoteVideosDesktop; i++) {
                elem[i].style.width = newWidth;
                $('.video video')[i].style.width = "100%";
                $('.video video')[i].style.height = "inherit";
                $('.video')[i].style.height = "auto";
            }
        }

    },


    // createDemoRemotes(str, total = 6) {
    //     let i = 0;

    //     let testInterval = setInterval(() => {
    //         let newVid = document.createElement('video');
    //         newVid.id = `demo-${i}-video`;
    //         newVid.srcObject = str;
    //         newVid.autoplay = true;
    //         newVid.className = 'remote-video';

    //         //video controls elements
    //         let controlDiv = document.createElement('div');
    //         controlDiv.className = 'remote-video-controls';
    //         controlDiv.innerHTML = `<i class="fa fa-microphone text-white pr-3 mute-remote-mic" title="Mute"></i>
    //             <i class="fa fa-expand text-white expand-remote-video" title="Expand"></i>`;

    //         //create a new div for card
    //         let cardDiv = document.createElement('div');
    //         cardDiv.className = 'card card-sm';
    //         cardDiv.id = `demo-${i}`;
    //         cardDiv.appendChild(newVid);
    //         cardDiv.appendChild(controlDiv);

    //         //put div in main-section elem
    //         document.getElementById('videos').appendChild(cardDiv);

    //         this.adjustVideoElemSize();

    //         i++;

    //         if (i == total) {
    //             clearInterval(testInterval);
    //         }
    //     }, 2000);
    // }


    participant(data, senderType) {
        if (senderType === 'remote') {
            let remoteUser = data.filter(user => user.email !== sessionStorage.getItem('email'))
            remoteUser.map(user => {
                document.getElementById(`${user.socketId}-name`).innerText = user.userName
                document.getElementById(`${user.socketId}-chatName`).innerText = user.userName
            })
        }
    }

};
