
//when clicked on Copy button
function copyClipBoard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).val()).select();
    document.execCommand("copy");
    $temp.remove();
}

//when clicked on Start now button
function roomLink() {
    var link = $('#room-created').val();
    $('#start-meeting').attr('href', link);
}

var url = $('url').val()
var ID = $('meeting-ID').val()

function joinWay(elem) {
    var join_way = $('#join-way').val()
    if (join_way == 'url') {
        $('#url').removeClass('uk-hidden')
        $('#meeting-ID').addClass('uk-hidden')
        $('#button-break').addClass('uk-hidden')
    } else if (join_way == 'meeting-ID') {
        $('#meeting-ID').removeClass('uk-hidden')
        $('#url').addClass('uk-hidden')
        $('#button-break').addClass('uk-hidden')
    }
}

$(document).ready(function () {
    $('#join-room').click(e => {
        let url = document.getElementById('room-join-url').value;
        let ID = document.getElementById('room-join-id').value;
        if (url) {
            window.location = url;
        } else if (!url) {
            document.getElementById('alert-room-link').classList.remove('uk-hidden')
            document.querySelector('#err-msg-room-link').innerHTML =
                "Meeting Link is required !";
        }
        if (ID) {
            window.location = `/?room=${ID}`;
        } else if (!ID) {
            document.getElementById('alert-room-id').classList.remove('uk-hidden')
            document.querySelector('#err-msg-room-id').innerHTML = "Meeting ID is required !";
        } else if (!ID && !url) {
            document.getElementById('alert-join-way').classList.remove('uk-hidden')
            document.querySelector('#err-msg-join-way').innerHTML 
                "Join way method is required !";
        }
    });

    $('#enter-room').click(e => {
        if (!$('#username').val()) {
            $('#alert-username').removeClass('uk-hidden')
        }
    });

    if ($(document).width() <= 768) {
        $('#nav-items').append($('#m-1'))
        $('#nav-items').append($('#m-2'))
        $('#nav-items').append($('#m-3'))
        $('#nav-items').append($('#m-4'))
        $('#nav-items').append($('#m-5'))
        $('#nav-items').append($('#m-6'))
        $('#toggle-chat-pane').click(e => {
            e.preventDefault()
            $('#chat-section').removeClass('uk-visible@m')
            $('.uk-close').click()
        })

    }

    $('#chat-close').click(e => {
       e.preventDefault()
        $('#chat-section').addClass('uk-visible@m')
    });

    if(location.href.includes('?')){
        let link = location.href.split('?')
        let room = link[1].split('=');
        let room_id = room[1];
        let url = link[0];
        // function continuousFetch(){
            //fetch call to get participants name from database
            // setTimeout(function(){
            //     fetch(`${url}meeting/participants/${room_id}`,{
            //         method:'get',
            //         headers:{
            //             'Content-Type': 'application/json'
            //         }
            //     }).then(res=> res.json()).then(jsonData=>{
                    
            //         jsonData.map(data=>{
            //             let li = document.createElement('li')
            //             let ul = document.getElementById('participant')
            //             li.innerText =''
            //             li.className = 'name_list'
            //             li.innerText = data.participant_name;
            //             ul.appendChild(li);  
            //         })        
            //         console.log(jsonData);
            //     });
            // },1000)
        // }
        // setInterval(function(){continuousFetch();},3000)
    }
    
});