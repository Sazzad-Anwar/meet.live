$(document)
    .ready(function () {
        let footerHeight = $('#footer').outerHeight();
        let navHeight = $('#navbar').outerHeight();
        let mainHeight = window.innerHeight - (footerHeight + 70);

        // $('#chat-messages').stop().animate({
        //     scrollTop: $('#chat-messages')[0].scrollHeight
        // }, 800);

        console.log(`${window.innerHeight} - (${footerHeight} + ${navHeight})`, document.getElementById('navbar').offsetHeight);

        $('.background').css('min-height', `${mainHeight - footerHeight}px`)
        $('.mainBody').css('min-height', `${mainHeight}px`)

        $('.mainBody .video-portion').css('min-height', `${mainHeight}px`)
        $('.chat-portion').css('height', `${mainHeight - footerHeight}px`)
        // $('.chat-message-area').css('height', `${mainHeight - footerHeight}px`)

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

        if ($('.video .remote-video').length < 2) {
            $('#local').css('width', '100%')
        }

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

$('.showJoinMeetingCard').on('click', () => {
    $('.joinMeetingRoom').toggleClass('hideOnMobile')
    $('.createMeetingRoom').toggleClass('hideOnMobile')
})

setTimeout(() => {
    if (window.innerWidth < 768 && $('.room-comm').hasClass('meeting-room')) {
        let toggleMute = $('#toggle-mute')
        let toggleVideo = $('#toggle-video')
        let leaveBtn = $('.leaveMeeting')

        $('#footer a').remove()
        $('#footer').addClass('footer-bg');
        $('#footer').css('height', '64px');
        $('#footer .navbar').addClass('p-0')
        $('#footer .container-fluid').removeClass('px-5')
        $('#footer .container-fluid').append(toggleMute)
        $('#footer .container-fluid').append(toggleVideo)
        $('#footer .container-fluid').append(leaveBtn)
    }
}, 1000)

function fnBrowserDetect() {

    let userAgent = navigator.userAgent;
    let browserName;

    if (userAgent.match(/chrome|chromium/i)) {
        browserName = "chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = "firefox";
        // $('#browser-alert').click()
    } else if (userAgent.match(/safari/i)) {
        browserName = "safari";
        // $('#browser-alert').click()
    } else if (userAgent.match(/opr\//i)) {
        browserName = "opera";
        // $('#browser-alert').click()
    } else if (userAgent.match(/edg/i)) {
        browserName = "edge";
        // $('#browser-alert').click()
    } else {
        browserName = "No browser detection";
    }

    $('.background').append(`
        <button type="button" hidden id="browser-alert" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">Launch static backdrop modal</button>
        <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title meeting" id="staticBackdropLabel">Browser Alert !</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                    You are using <b>${browserName}</b>.
                    Please move to <b>Chrome/Chromium/Crios</b>  browser for better and smooth experience.
                    </div>
                        <div class="modal-footer">
                        <a href="/" class="btn bg-purple text-white" data-bs-dismiss="modal">Close</a>
                    </div>
                </div>
            </div>
        </div>
    `)

    switch (browserName) {
        case 'firefox':
            $('#browser-alert').click()
            break;
        case 'safari':
            $('#browser-alert').click()
            break;
        case 'opera':
            $('#browser-alert').click()
            break;
        case 'edge':
            $('#browser-alert').click()
            break;
        default:
            break;
    }


}

// fnBrowserDetect()


function shareToApp() {
    let link = $('#meeting-link').text()
    if (navigator.share) {
        navigator.share({
            title: 'Royex.live',
            text: 'You are invited to join in a meeting.',
            url: link ? link : window.location.href,
        })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
    }
}