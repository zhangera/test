/**
 * Created by Administrator on 2018/3/14.
 */

let socketio = require("socket.io");
let io;
let guestNumber = 1;
let nickName = [];
let namesUsed = [];
let currentRoom = [];

//分配昵称
function assignGuestName(socket,guestNumber,nickName,nameUsed){
    let name = 'Guest' + guestNumber;
    nickName[socket.id] = name;
    socket.emit('nameResult',{
        success:true,
        name:name
    });
    namesUsed.push(name);
    return guestNumber + 1;
}

//进入聊天室
function joinRoom(socket,room){
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult',{room:room});
    socket.broadcast.to(room).emit('message',{
        text:nickName[socket.id] + 'has joined ' + room + '.'
    });
    let usersInRoom = io.sockets.clients(room);
    if(usersInRoom.length > 1){
        let usersInRoomSummary = 'Users currently in' + room +':';
        for(let index in usersInRoom){
            let userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id){
                if(index > 0){
                    usersInRoomSummary += ',';
                }
                usersInRoomSummary += nickName[userSocketId];
            }
        }
        usersInRoomSummary += '.';
        socket.emit('message',{text:usersInRoomSummary});
    }
}

//更名
function handleNameChangeAttempts(socket,nickName,namesUsed){
    socket.on('nameAttemp', function ( name ) {
        if(name.indexOf('Guest') == 0){
            socket.emit('nameResult',{
                success:false,
                message:'Name cannot begin with "Guest" .'
            })
        }else{
            if(namesUsed.indexOf(name) == -1){
                let previousName = nickName[socket.id];
                let previousNameIndex = namesUsed.indexOf(previousName);
                namesUsed.push(name);
                nickName[socket.id] = name;
                delete namesUsed[previousNameIndex];
                console.log('进来');
                socket.emit('nameResult',{
                    success:true,
                    name:name
                })
                socket.broadcast.to(currentRoom[socket.id]).emit('message',{
                    text:previousName + 'is now known as ' +　name
                })
            }else{
                socket.emit('nameResult',{
                    success:false,
                    message:'Name is already in use .'
                })
            }
        }
    })
}

//更换房间
function handleRoomJoining(socket){
    socket.on('join', function ( room ) {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket,room);
    })
}

//用户离开
function handleClientDisconnection(socket,nickName,namesUsed){
    socket.on('disconnect', function () {
        var nameIndex = namesUsed.indexOf(nickName[socket.id]);
        delete namesUsed[nameIndex];
        delete nickName[socket.id];
    })
}

function handleMessageBroadcasting(socket){
    socket.on('message', function (message) {
        socket.broadcast.to(message.room).emit('message',{
            text:nickName[socket.id] + ': ' + message.text
        })
    })
}

exports.listen = function ( server ) {
    io = socketio.listen(server);
    io.set('log level',1);
    io.sockets.on('connection', function ( socket ) {
        guestNumber = assignGuestName(socket,guestNumber,nickName,namesUsed);
        joinRoom(socket,'Lobby');
        handleMessageBroadcasting(socket,nickName);
        handleNameChangeAttempts(socket,nickName,namesUsed);
        handleRoomJoining(socket);
        socket.on('rooms', function () {
            socket.emit('rooms',io.sockets.manager.rooms);
        });
        handleClientDisconnection(socket,nickName,namesUsed);
    })
};
