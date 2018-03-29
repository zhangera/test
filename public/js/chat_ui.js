/**
 * Created by Administrator on 2018/3/14.
 */

let socket = io.connect();

$(document ).ready( function () {
    let chatApp = new Chat(socket);
    socket.on('nameResult', function ( result ) {
        let message;
        if(result.success){
            message = 'you are now known as ' + result.name ;
        }else{
            message = result.message;
        }
        $("#messages").append(divSystemContentElement(message));
    })
    socket.on('joinResult', function (result) {
        $("#room").text(result.room);
        $("#messages").append(divSystemContentElement("change success"));
    });
    socket.on('message', function (message) {
        let newElement = $("<div></div>").text(message.text);
        $("#messages").append(newElement);
    })
    socket.on('rooms', function ( rooms ) {
        $("#room-list").empty();
        for(let room in rooms){
            room = room.substring(1,room.length);
            if(room != ''){
                $("#room-list").append(divEscapedContentElement(room))
            }
        }
        $("#room-list div").click( function () {
            chatApp.processCommand('/join '+$(this).text());
            $("#send-message").focus();
        })
    })
    setInterval( function () {
        socket.emit('rooms');
    },1000);
    $("#send-message").focus();
    $("#send-button").click(function () {
        processUserInput(chatApp,socket);
        return false;
    })

})

function divEscapedContentElement(message){
    return $("<div></div>").text(message);
}

function divSystemContentElement(message){
    return $("<div></div>").html(message);
}


//处理用户输入
function processUserInput(chatApp,socket){
    let message = $("#send-message").val();
    let systemMessage;
    if(message.charAt(0) == '/'){
        systemMessage = chatApp.processCommand(message);
        if(systemMessage){
            $("#messages").append(divSystemContentElement(systemMessage));
        }
    }else{
        chatApp.sendMessage($("#room").text(),message);
        $("#messages").append(divSystemContentElement(message));
        $("#message").scrollTop($("#messages").prop('scrollHeight'));
    }
    $("#send-message").val('');
}




















