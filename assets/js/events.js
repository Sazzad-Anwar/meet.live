import helpers from './helpers.js';

window.addEventListener('load', () => {
    //When the chat icon is clicked
    // document.querySelector('#toggle-chat-pane').addEventListener('click', (e) => {
    //     let chatElem = document.querySelector('#chat-pane');
    //     let mainSecElem = document.querySelector('#main-section');

    //     if (chatElem.classList.contains('chat-opened')) {
    //         chatElem.setAttribute('hidden', true);
    //         mainSecElem.classList.remove('col-md-9');
    //         mainSecElem.classList.add('col-md-12');
    //         chatElem.classList.remove('chat-opened');
    //     }

    //     else {
    //         chatElem.attributes.removeNamedItem('hidden');
    //         mainSecElem.classList.remove('col-md-12');
    //         mainSecElem.classList.add('col-md-9');
    //         chatElem.classList.add('chat-opened');
    //     }

    //     //remove the 'New' badge on chat icon (if any) once chat is opened.
    //     setTimeout(() => {
    //         if (document.querySelector('#chat-pane').classList.contains('chat-opened')) {
    //             helpers.toggleChatNotificationBadge();
    //         }
    //     }, 300);
    // });


    //When the video frame is clicked. This will enable picture-in-picture
    // document.getElementById('local').addEventListener('click', () => {
    //     if (!document.pictureInPictureElement) {
    //         document.getElementById('local').requestPictureInPicture()
    //             .catch(error => {
    //                 // Video failed to enter Picture-in-Picture mode.
    //                 console.error(error);
    //             });
    //     }

    //     else {
    //         document.exitPictureInPicture()
    //             .catch(error => {
    //                 // Video failed to leave Picture-in-Picture mode.
    //                 console.error(error);
    //             });
    //     }
    // });


    //When the 'Create room" is button is clicked
    document.getElementById('create-room').addEventListener('click', (e) => {
        e.preventDefault();
        let roomName = document.querySelector('#room-name').value;
        let yourName = document.querySelector('#your-name').value;
        let yourEmail = document.querySelector('#your-email').value;

        if (roomName && yourName && yourEmail) {
            //remove error message, if any
            document.querySelector('#meeting-name-error').innerHTML = "";
            document.querySelector('#user-name-error').innerHTML = "";
            document.querySelector('#user-email-error').innerHTML = "";

            //save the user's name in sessionStorage
            sessionStorage.setItem('username', yourName);
            sessionStorage.setItem('email', yourEmail);
            sessionStorage.setItem('isHost', true);

            //get a random string
            let roomId = helpers.generateRandomString()

            //create room link
            let roomLink = `${location.origin}?room=${roomName.trim().replace(' ', '_')}_${roomId}`;



            //show message with link to room
            // document.querySelector( '#room-created' ).innerHTML = `Room successfully created. Click <a href='${ roomLink }'>here</a> to enter room. 
            //     Share the room link with your partners.`;

            // show room-created details page
            $('#room-created-details').removeAttr('hidden')
            $('#room-create').attr('hidden', true)

            $('#link-id').text(roomId)
            $('#meeting-link').text(roomLink)

            //empty the values
            document.querySelector('#room-name').value = '';
            document.querySelector('#your-name').value = '';
            document.querySelector('#your-email').value = '';
        }

        if (!roomName) {
            document.querySelector('#meeting-name-error').innerHTML = "This field is required";
        }
        else {
            document.querySelector('#meeting-name-error').innerHTML = "";
        }

        if (!yourName) {
            document.querySelector('#user-name-error').innerHTML = "This field is required";
        } else {
            document.querySelector('#user-name-error').innerHTML = "";
        }

        if (!yourEmail) {
            document.querySelector('#user-email-error').innerHTML = "This field is required";
        } else {
            document.querySelector('#user-email-error').innerHTML = "";
        }
    });


    //When the 'Enter room' button is clicked.
    document.getElementById('enter-room').addEventListener('click', (e) => {
        e.preventDefault();

        let name = document.querySelector('#username').value;
        let email = document.querySelector('#userEmail').value;

        if (name && email && !email.includes('@')) {
            document.querySelector('#username-error').innerHTML = "This is not a real email";
        }
        else {
            //remove error message, if any
            document.querySelector('#username-error').innerHTML = "";
            document.querySelector('#userEmail-error').innerHTML = "";

            //save the user's name in sessionStorage
            sessionStorage.setItem('username', name);

            //save the user's name in sessionStorage
            sessionStorage.setItem('email', email);
            sessionStorage.setItem('isHost', false);

            let audioMute = sessionStorage.getItem('audio-mute')
            let videoMute = sessionStorage.getItem('video-mute')

            sessionStorage.setItem('audio-mute', audioMute ? audioMute : false)
            sessionStorage.setItem('video-mute', videoMute ? videoMute : false)

            //reload room
            location.reload();
        }

        if (!name) {
            document.querySelector('#username-error').innerHTML = "This field is required";
        }

        else {
            document.querySelector('#username-error').innerHTML = ""
        }

        if (!email) {
            document.querySelector('#userEmail-error').innerHTML = "This field is required";
        }
        else {
            document.querySelector('#userEmail-error').innerHTML = "";
        }
    });


    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('expand-remote-video')) {
            helpers.maximiseStream(e);
        }

        else if (e.target && e.target.classList.contains('mute-remote-mic')) {
            helpers.singleStreamToggleMute(e);
        }
    });


    // document.getElementById('closeModal').addEventListener('click', () => {
    //     helpers.toggleModal('recording-options-modal', false);
    // });
});
