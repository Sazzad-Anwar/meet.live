$(document)
    .ready(function () {
        let footerHeight = $('#footer').outerHeight();
        let navHeight = $('#navbarSupportedContent').outerHeight();
        let msgInputHeight = $('.input-area').outerHeight();
        let participantDetails = $('.participant-details').outerHeight();
        let participantList = $('.participant-list').outerHeight();
        let chatTitle = $('.chat').outerHeight();
        console.log(window.innerHeight, navHeight, footerHeight);
        let mainHeight = window.innerHeight - (footerHeight + navHeight);
        let chatArea = window.innerHeight - (navHeight + participantDetails + participantList)
        let msgBodyHeight = chatArea - (msgInputHeight + chatTitle + footerHeight);
        let chatMessagesHeight = $('#chat-messages').outerHeight()
        $('#chat-messages').stop().animate({
            scrollTop: $('#chat-messages')[0].scrollHeight
        }, 800);

        $('.background').css('min-height', `${mainHeight}px`)
        $('.mainBody').css('min-height', `${mainHeight}px`)
        $('.mainBody .video-portion').css('min-height', `${mainHeight}px`)
        $('.chat-body .message').css('height', `${msgBodyHeight}px`)
        $('.chat-message-area').css('height', `${chatArea}px`);

        $('.navbar-toggler-icon').on('click', () => {
            if ($('.navbar-toggler-icon i').text() === 'menu') {
                $('.navbar-toggler-icon i').text('close')
            } else {
                $('.navbar-toggler-icon i').text('menu')
            }
        })

        let meetingId = window.location.search?.split('=')[1]?.split('_')
        meetingId?.pop();
        let roomName = meetingId?.join('-')

        $('#meeting-room-name').val(roomName)
    });

function notification(text) {
    $('body').append(`
        <div class="notification shadow-lg bg-purple">${text}</div>
    `)
    $('.notification').css('opacity', '1');

    setTimeout(() => {
        $('.notification').css('opacity', '0');
    }, 3000)
}

function copyLink() {
    let link = $('#meeting-link').text()
    if (link) {
        navigator.clipboard.writeText(
            link
        );
    } else {
        navigator.clipboard.writeText();
    }
    notification('Link has copied')
}

function startMeeting() {
    let link = $('#meeting-link').text()
    location.href = link;
}

function getFullUrl() {

    let link = $('#meetingID-URL').val().trim()
    if (link.includes('=')) {
        window.location.href = (`?room=${link.split('=')[1]}`)
    } else {
        window.location.href = (`?room=${link}`)
    }
}

function leaveMeeting() {
    if (confirm('Leave the meeting') === true) {
        location.href = '/'
    }
}

function userMediaAvailable() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

let myStream = ''

function getUserFullMedia() {
    if (userMediaAvailable()) {
        return navigator.mediaDevices.getUserMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            }
        });
    }

    else {
        notification('User media not available')
        throw new Error('User media not available');
    }
}

function stopMedia(trackKind) {
    if (trackKind === 'video') {
        myStream.getVideoTracks().map(track => {
            if (track.readyState == 'live' && track.kind === 'video') {
                track.enabled = false
            }
        });
    }
    else if (trackKind === 'audio') {
        myStream.getAudioTracks().map(track => {
            if (track.readyState == 'live' && track.kind === 'audio') {
                track.enabled = false
            }
        });
    }
    else {
        myStream.getTracks().map(track => {
            if (track.readyState == 'live') {
                track.enabled = false
                track.stop()
            }
        });
    }
}

function startMedia(trackKind) {
    if (trackKind === 'video') {
        myStream.getVideoTracks().map(track => {
            if (track.readyState == 'live' && track.kind === 'video') {
                track.enabled = true
            }
        });
    }
    else if (trackKind === 'audio') {
        myStream.getAudioTracks().map(track => {
            if (track.readyState == 'live' && track.kind === 'audio') {
                track.enabled = true
            }
        });
    }
    // else {
    //     myStream.getTracks().map(track => {
    //         if (track.readyState == 'live') {
    //             track.enabled = true
    //         }
    //     });
    // }
}

$('#check-camera-switch').on('click', () => {

    let videoElem = document.createElement('video')
    $('#check-camera-switch i').addClass('icon-active')
    videoElem.id = "check-camera"
    videoElem.autoplay = 'autoplay'
    $('#close-camera-check').css('display', 'block')
    $('#form-element').hide()

    if (!$('#check-camera').length) {

        if (sessionStorage.getItem('video-mute') !== true) {

            $('#check-camera-panel').append(videoElem)

            getUserFullMedia().then(stream => {
                videoElem.srcObject = stream
                myStream = stream;
            })
        }
    } else {
        stopMedia();
        $('#check-camera').remove();
        $('#close-camera-check').css('display', 'none')
        $('#check-camera-switch i').removeClass('icon-active')
        $('#form-element').show()
    }
})

$('#mute-audio-switch').on('click', () => {
    if ($('#mute-audio-switch i').text() === 'mic_none') {
        $('#mute-audio-switch i').text('mic_off')
        $('#mute-audio-switch p').text('Mic Off')
        $('#mute-audio-switch i').addClass('icon-active')
        sessionStorage.setItem('audio-mute', true);
        stopMedia('audio')
    } else {
        $('#mute-audio-switch i').text('mic_none')
        $('#mute-audio-switch p').text('Mic On')
        $('#mute-audio-switch i').removeClass('icon-active')
        sessionStorage.setItem('audio-mute', false);
        startMedia('audio')
    }
})

$('#mute-video-switch').on('click', () => {
    if ($('#mute-video-switch i').text() === 'videocam') {
        $('#mute-video-switch i').text('videocam_off')
        $('#mute-video-switch i').addClass('icon-active')
        $('#mute-video-switch p').text('video Off')
        sessionStorage.setItem('video-mute', true);
        stopMedia('video')
    } else {
        $('#mute-video-switch i').text('videocam')
        $('#mute-video-switch p').text('video On')
        $('#mute-video-switch i').removeClass('icon-active')
        sessionStorage.setItem('video-mute', false);
        startMedia('video')
    }
})

$('#close-camera-check').on('click', () => {
    myStream.getTracks().map(track => {
        if (track.readyState == 'live') {
            track.enabled = false
            track.stop()
        }
    });
    $('#check-camera').remove();
    $('#close-camera-check').css('display', 'none')
    $('#check-camera-switch i').removeClass('icon-active')
    $('#form-element').show();
});