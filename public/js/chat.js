/**
 * Created by Administrator on 2018/3/14.
 */

let Chat = function ( socket ) {
    this.socket = socket;
}

Chat.prototype.sendMessage = function ( room, text ) {
    let message = {
        room:room,
        text:text
    }
    this.socket.emit('message',message);
}

Chat.prototype.changeRoom = function ( room ) {
    //console.log(room)
    this.socket.emit('join',room)
}

Chat.prototype.processCommand = function ( command ) {
    let words = command.split(' ');
    let command0 = words[0].substring(1,words[0].length).toLowerCase();
    let message = false;
    switch (command0){
        case 'join':
            words.shift();
            console.log(words);
            let room = words.join(' ');
            console.log(room);
            this.changeRoom(room);
            break;
        case 'nick':
            words.shift();
            let name = words.join(' ');
            console.log(name);
            this.socket.emit('nameAttemp',name);

            break;
        default:
            message = 'Unrecognized command.';
            break;
    }
    return message;
}

















