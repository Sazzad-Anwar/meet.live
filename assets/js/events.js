import helpers from './helpers.js';

window.addEventListener( 'load', () => {

    //When the chat icon is clicked
        let baseUrl;
        // document.querySelector( '#toggle-chat-pane' ).addEventListener( 'click', ( e ) => {
            let chatElem = document.querySelector( '#chat-pane' );
            let mainSecElem = document.querySelector( '#main-section' );
    
            if ( chatElem.classList.contains( 'chat-opened' ) ) {
                chatElem.setAttribute( 'hidden', true );
                // mainSecElem.classList.remove( 'col-md-9' );
                mainSecElem.classList.add( 'col-md-12' );
                chatElem.classList.remove( 'chat-opened' );
            }

            else {
                // chatElem.attributes.removeNamedItem( 'hidden' );
                mainSecElem.classList.remove( 'col-md-12' );
                // mainSecElem.classList.add( 'col-md-9' );
                chatElem.classList.add( 'chat-opened' );
                document.getElementById('main-section').classList.add('video-panel');

                if($('#main-section').attr('hidden') !== 'hidden'){
                    $('#footer-for-video-panel').removeClass('uk-hidden')
                    let link = location.href.split('?')
                    let room = link[1].split('=');
                    let room_id = room[1];
                    let url = link[0];

                    // console.log($('#partnerID').val());

                    // function continuousFetch(){
                    //     //fetch call to get participants name from database
                    //     fetch(`${url}meeting/participants/${room_id}`,{
                    //         method:'get',
                    //         headers:{
                    //             'Content-Type': 'application/json'
                    //         }
                    //     }).then(res=> res.json()).then(jsonData=>{
                            
                    //         jsonData.map(participant=>{
                    //             let li = document.createElement('li')
                    //             let ul = document.getElementById('participant')

                    //             li.className = 'name_list'
                    //             li.innerText = participant.participant_name
                    //             console.log(participant);
                    //             ul.appendChild(li);  
                    //         })

                    //         console.log(jsonData);
                    //     });
                    // }
                    // setTimeout(function(){continuousFetch();},3000)
                }
            }
    
            //remove the 'New' badge on chat icon (if any) once chat is opened.
            setTimeout( () => {
                if ( document.querySelector( '#chat-pane' ).classList.contains( 'chat-opened' ) ) {
                    helpers.toggleChatNotificationBadge();
                }
            }, 300 );
        // } );


    //When the video frame is clicked. This will enable picture-in-picture
    document.getElementById( 'local' ).addEventListener( 'click', () => {
        if ( !document.pictureInPictureElement ) {
            document.getElementById( 'local' ).requestPictureInPicture()
                .catch( error => {
                    // Video failed to enter Picture-in-Picture mode.
                    console.error( error );
                } );
        }

        else {
            document.exitPictureInPicture()
                .catch( error => {
                    // Video failed to leave Picture-in-Picture mode.
                    console.error( error );
                } );
        }
    } );

    //When the 'Create room" is button is clicked
    document.getElementById( 'create-room' ).addEventListener( 'click', ( e ) => {
        e.preventDefault();
        let roomName = document.querySelector( '#room-name' ).value;
        let yourName = document.querySelector( '#your-name' ).value;
        let yourEmail = document.querySelector( '#your-email' ).value;

        if ( roomName && yourName && yourEmail ) {
            //remove error message, if any
            // document.querySelector( '#err-msg' ).innerHTML = "";

            //save the user's name in sessionStorage
            sessionStorage.setItem( 'username', yourName );

            //create room link
            let roomLink = `${ location.origin }?room=${ roomName.replace(/\s+/g,'_')}_${ helpers.generateRandomString() }`;

            //show message with link to room
            document.querySelector( '#room-created' ).value = `${ roomLink }`;
            document.querySelector( '#room-id' ).innerHTML = `Meeting ID: ${ roomName.replace(/\s+/g,'_')}_${ helpers.generateRandomString() }`;
            
            document.querySelector('#room-creation').classList.remove('uk-hidden')
            document.querySelector('#room-create').classList.add('uk-hidden')

            //empty the values
            document.querySelector( '#room-name' ).value = '';
            document.querySelector( '#your-name' ).value = '';
            document.querySelector( '#your-email' ).value = '';

            let room = roomLink.split('?')
            let meetingRoomlink = room[1].split('=');
            let room_id = meetingRoomlink[1]
            baseUrl = room[0];

            console.log(`${baseUrl}/meeting/room_create`);

            let room_creation_data={
                "meeting_id":room_id,
                "meeting_name":roomName,
                "room_master_name":yourName,
                "room_master_email":yourEmail,
            }

            // fetch call to store in databse
            fetch(`${baseUrl}/meeting/room_create`,{
                method:'post',
                body:JSON.stringify(room_creation_data),
                headers:{
                    'Content-Type': 'application/json'
                }
            }).then(res=> res.json()).then(jsonData=> console.log(jsonData))

        }
        else if(!roomName) {
            document.getElementById('alert-room-name').classList.remove('uk-hidden')
            document.querySelector( '#err-msg-room-name' ).innerHTML = "Room Name is required";

        }
        else if(!yourName) {
            document.getElementById('alert-name').classList.remove('uk-hidden')
            document.querySelector( '#err-msg-name' ).innerHTML = "Your name is required";

        }
        else if(!yourEmail) {
            document.getElementById('alert-email').classList.remove('uk-hidden')
            document.querySelector( '#err-msg-email' ).innerHTML = "Your email is required";

        }
    } );


    //When the 'Enter room' button is clicked.
    document.getElementById('enter-room').addEventListener( 'click', ( e ) => {
        e.preventDefault();

        let name = document.querySelector( '#username' ).value;
        let meeting_id = document.querySelector( '#meeting-id' ).value;
        // let partnerID = document.querySelector( '#partnerID' ).value;

        if ( name ) {
            //remove error message, if any
            document.querySelector( '#err-msg-username' ).innerHTML = "";

            //save the user's name in sessionStorage
            sessionStorage.setItem( 'username', name );

            //reload room
            location.reload();

            let join_data={
                "name":name,
                "meeting_id":meeting_id,
            }
            let room = location.href.split('?')
            let url = room[0]

            //fetch call to store in database
            fetch(`${url}meeting/participant/join`,{
                method:'post',
                body:JSON.stringify(join_data),
                headers:{
                    'Content-Type': 'application/json'
                }
            })
        }

        else {
            document.querySelector( '#err-msg-username' ).innerHTML = "Your name is required !";
        }
    } );


    document.addEventListener( 'click', ( e ) => {
        if ( e.target && e.target.classList.contains( 'expand-remote-video' ) ) {
            helpers.maximiseStream( e );
        }

        else if ( e.target && e.target.classList.contains( 'microphone' ) ) {
            helpers.singleStreamToggleMute( e );
        }
    } );


    document.getElementById( 'closeModal' ).addEventListener( 'click', () => {
        helpers.toggleModal( 'recording-options-modal', false );
    } );
} );