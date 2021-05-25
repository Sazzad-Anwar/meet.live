export default {
    generateRandomString() {
        const crypto = window.crypto || window.msCrypto;
        let array = new Uint32Array(1);
        
        return crypto.getRandomValues(array);
    },


    closeVideo( elemId ) {
        if ( document.getElementById( elemId ) ) {
            document.getElementById( elemId ).remove();
            this.adjustVideoElemSize();
        }
    },

    pageHasFocus() {
        return !( document.hidden || document.onfocusout || window.onpagehide || window.onblur );
    },


    getQString( url = '', keyToReturn = '' ) {
        url = url ? url : location.href;
        let queryStrings = decodeURIComponent( url ).split( '#', 2 )[0].split( '?', 2 )[1];

        if ( queryStrings ) {
            let splittedQStrings = queryStrings.split( '&' );

            if ( splittedQStrings.length ) {
                let queryStringObj = {};

                splittedQStrings.forEach( function ( keyValuePair ) {
                    let keyValue = keyValuePair.split( '=', 2 );

                    if ( keyValue.length ) {
                        queryStringObj[keyValue[0]] = keyValue[1];
                    }
                } );

                return keyToReturn ? ( queryStringObj[keyToReturn] ? queryStringObj[keyToReturn] : null ) : queryStringObj;
            }

            return null;
        }

        return null;
    },


    userMediaAvailable() {
        return !!( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
    },


    getUserFullMedia() {
        if ( this.userMediaAvailable() ) {
            return navigator.mediaDevices.getUserMedia( {
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            } );
        }

        else {
            throw new Error( 'User media not available' );
        }
    },


    getUserAudio() {
        if ( this.userMediaAvailable() ) {
            return navigator.mediaDevices.getUserMedia( {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            } );
        }

        else {
            throw new Error( 'User media not available' );
        }
    },



    shareScreen() {
        if ( this.userMediaAvailable() ) {
            return navigator.mediaDevices.getDisplayMedia( {
                video: {
                    cursor: "always"
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            } );
        }

        else {
            throw new Error( 'User media not available' );
        }
    },


    getIceServer() {
        return {
            iceServers: [
                {
                    urls: ["stun:stun.royex.io"]
                },
                {
                    "urls": ["turn:turn.royex.io:3478?transport=udp",
                             "turn:turn.royex.io:5349?transport=tcp"
                           ],
                    "username": "royex",
                    "credential": "12345"
                }
            ]
        };
    },

    kick(data,senderType){
        console.log(data,senderType);
        if(senderType === 'remote'){
            if(document.getElementById(`${data}-participant`)){

                document.getElementById(`${data}-participant`).remove()
            }else{
                window.location ='/';
            }
            console.log(data);
        }else{
            if(document.getElementById(`${data}-participant`)){

                document.getElementById(`${data}-participant`).remove()
            }else{
                window.location ='/';
            }
            console.log(data);
        }
    },

    participent(data,senderType){
        if(senderType === 'remote'){
            setInterval(function(){ 
                $(`#${data.socketId}-name`).text(data.sender);
                
            }, 1000);
            
            // let ul = document.getElementById('participant')
            // let li = document.createElement('li')
            // li.id = `${data.socketId}-participant`
            // li.classList = 'name_list'
            // ul.appendChild(li)
            // $(`#${data.socketId}-participant`).text(data.sender);

            let div = document.getElementById('participant');
            let nameList = document.createElement('div');
            nameList.id = `${data.socketId}-participant`;
            nameList.className = 'name_list';
            div.appendChild(nameList);

            setInterval(function () {
                $(`#${data.socketId}-participant`).text(data.sender);
            }, 1000);

        }
    },

    showImageOnMuteVideo(data,type){
        console.log(data.status === 1 && type === 'remote',data,type);
        if(data.status === 1){
            $(`#${data.socketId}-image`).removeClass('uk-hidden');
            $(`#${data.socketId}-mutename`).text(data.sender);
            $(`#${data.socketId}-video`).addClass('uk-hidden');
            $(`#${data.socketId}-video > .remote-video-controls`).addClass('uk-hidden')
            localStorage.setItem(data.socketId,data.status)
        }
        else{
            $(`#${data.socketId}-image`).addClass('uk-hidden');
            $(`#${data.socketId}-video`).removeClass('uk-hidden');
            $(`#${data.socketId}-video > .remote-video-controls`).removeClass('uk-hidden')
            localStorage.setItem(data.socketId,data.status)
        }
    },

    removeParticipant(data){
        // $(`#${data}-participant`).hide()
        document.getElementById(`${data}-participant`).remove()
    },

    addChat( data, senderType ) {
        let chatMsgDiv = document.querySelector( '#chat-messages' );
        let contentAlign = 'uk-text-left ml-4 pl-1';
        let senderName = data.sender;
        let msgBg = 'chat-bg';
        let user=''
        if ( senderType === 'remote' ) {
            contentAlign = 'uk-text-left ml-4 pl-1';
            senderName = data.sender;
            msgBg = 'chat-bg';
            user = senderName
            this.toggleChatNotificationBadge();
        }

        let infoDiv = document.createElement( 'div' );
        infoDiv.className = 'sender-info ml-0  ';
        // infoDiv.innerHTML = `${ senderName } - ${ moment().format( 'Do MMMM, YYYY h:mm a' ) }`;
        infoDiv.innerHTML = `@${ senderName } | ${ moment().format( 'h:mm a' ) }`;

        let colDiv = document.createElement( 'div' );
        colDiv.className = `col-10 card chat-card msg ${ msgBg } p-2`;
        colDiv.innerHTML = xssFilters.inHTMLData( data.msg ).autoLink( { target: "_blank", rel: "nofollow"});
        
        colDiv.style.wordBreak = 'break-all'
        colDiv.style.minWidth = '97%'

        let rowDiv = document.createElement( 'div' );
        rowDiv.className = `row ${ contentAlign } mb-2`;

        // colDiv.appendChild( infoDiv );
        // rowDiv.appendChild( colDiv );
        rowDiv.appendChild( infoDiv );
        rowDiv.appendChild( colDiv );

        chatMsgDiv.appendChild( rowDiv );

        /**
         * Move focus to the newly added message but only if:
         * 1. Page has focus
         * 2. User has not moved scrollbar upward. This is to prevent moving the scroll position if user is reading previous messages.
         */
        if ( this.pageHasFocus ) {
            rowDiv.scrollIntoView();
        }
    },


    toggleChatNotificationBadge() {
        if ( document.querySelector( '#chat-pane' ).classList.contains( 'chat-opened' ) ) {
            // document.querySelector( '#new-chat-notification' ).setAttribute( 'hidden', true );
        }

        else {
            document.querySelector( '#new-chat-notification' ).removeAttribute( 'hidden' );
        }
    },



    replaceTrack( stream, recipientPeer ) {
        let sender = recipientPeer.getSenders ? recipientPeer.getSenders().find( s => s.track && s.track.kind === stream.kind ) : false;

        sender ? sender.replaceTrack( stream ) : '';
    },



    toggleShareIcons( share ) {
        let shareIconElem = document.querySelector( '#share-screen' );

        if ( share ) {
            shareIconElem.setAttribute( 'title', 'Stop sharing screen' );
            // shareIconElem.children[0].classList.add( 'text-primary' );
            // shareIconElem.children[0].classList.remove( 'text-white' );
        }

        else {
            shareIconElem.setAttribute( 'title', 'Share screen' );
            // shareIconElem.children[0].classList.add( 'text-white' );
            // shareIconElem.children[0].classList.remove( 'text-primary' );
        }
    },


    toggleVideoBtnDisabled( disabled ) {
        document.getElementById( 'toggle-video' ).disabled = disabled;
    },


    maximiseStream( e ) {
        let elem = e.target.parentElement.previousElementSibling;

        elem.requestFullscreen() || elem.mozRequestFullScreen() || elem.webkitRequestFullscreen() || elem.msRequestFullscreen();
    },


    singleStreamToggleMute( e ) {
        if ( e.target.classList.contains( 'fa-microphone' ) ) {
            e.target.parentElement.previousElementSibling.muted = true;
            e.target.setAttribute('src', '../assets/img/close-mute.png')
            e.target.classList.remove( 'fa-microphone' );
            e.target.setAttribute('uk-tooltip', 'title:Voice is muted; pos:bottom')
        }
        else {
            e.target.parentElement.previousElementSibling.muted = false;
            e.target.setAttribute('src', '../assets/img/mike.png')
            e.target.classList.add( 'fa-microphone' );
            e.target.setAttribute('uk-tooltip', 'title:Voice is audible; pos:bottom')
        }
    },


    saveRecordedStream( stream, user ) {
        let blob = new Blob( stream, { type: 'video/webm' } );

        let file = new File( [blob], `${ user }-${ moment().unix() }-record.webm` );

        saveAs( file );
    },


    toggleModal( id, show ) {
        let el = document.getElementById( id );

        if ( show ) {
            el.style.display = 'block';
            el.removeAttribute( 'aria-hidden' );
        }

        else {
            el.style.display = 'none';
            el.setAttribute( 'aria-hidden', true );
        }
    },



    setLocalStream( stream, mirrorMode = true ) {
        const localVidElem = document.getElementById( 'local' );

        localVidElem.srcObject = stream;
        mirrorMode ? localVidElem.classList.add( 'mirror-mode' ) : localVidElem.classList.remove( 'mirror-mode' );
    },


    adjustVideoElemSize() {
        let elem = document.getElementsByClassName( 'card' );
        let totalRemoteVideosDesktop = elem.length;
        let newWidth = totalRemoteVideosDesktop <= 2 ? '50%' : (
            totalRemoteVideosDesktop == 3 ? '33.33%' : (
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


        for ( let i = 0; i < totalRemoteVideosDesktop; i++ ) {
            elem[i].style.width = newWidth;
        }
    },


    createDemoRemotes( str, total = 20 ) {
        let i = 0;

        let testInterval = setInterval( () => {
            let newVid = document.createElement( 'video' );
            newVid.id = `demo-${ i }-video`;
            newVid.srcObject = str;
            newVid.autoplay = true;
            newVid.className = 'remote-video';

            //video controls elements
            let controlDiv = document.createElement( 'div' );
            controlDiv.className = 'remote-video-controls';
            controlDiv.className = 'remote-video-controls-top';
            controlDiv.innerHTML = `<i class="fa fa-microphone text-white pr-3 mute-remote-mic" title="Mute"></i>
            <div uk-icon="icon: desktop; ratio: 2" class="expand-remote-video white_text" uk-tooltip="title:view full screen;pos:bottom"></div>`;

            //create a new div for card
            let cardDiv = document.createElement( 'div' );
            // cardDiv.className = 'card card-sm';
            cardDiv.className = 'uk-card uk-card-default';
            cardDiv.className = 'video-window-border';
            cardDiv.id = `demo-${ i }`;
            cardDiv.appendChild( newVid );
            cardDiv.appendChild( controlDiv );

            //put div in main-section elem
            document.getElementById( 'videos' ).appendChild( cardDiv );

            this.adjustVideoElemSize();

            i++;

            if ( i == total ) {
                clearInterval( testInterval );
            }
        }, 2000 );
    }
};
