/**
 * Created by Administrator on 2018/3/14.
 */

let http = require("http");
let fs = require("fs");
let mime = require("mime");
let path = require("path");
let cache = {};

//创建server
let server = http.createServer( function ( req, res ) {
    let filePath = false;
    console.log
    if(req.url == '/'){
        filePath = 'public/index.html';
    }else{
        filePath = 'public' + req.url;
    }
    let absPath = './' + filePath;
    serverStatic(res,cache,absPath);
});
server.listen(3000, function () {
    console.log('Server listening on port 3000');
});


//聊天server
let chatServer = require('./lib/chat_server');
chatServer.listen(server);

//404请求
function send404(res){
    res.writeHead(404,{'Content-Type':'text/plain'});
    res.write('Error 404: resource not Found');
    res.end();
}

//文件请求
function sendFile(res,filepath,filecontents){
    res.writeHead(200,{'Content-Type':mime.lookup(path.basename(filepath))});
    res.end(filecontents);
}

//静态文件响应
function serverStatic(res,cache,absPath){
    if(cache[absPath]){
        sendFile(res,absPath,cache[absPath]);
    }else{
        fs.exists(absPath, function ( exists ) {
            if(exists){
                fs.readFile(absPath, function ( err, data ) {
                    if(err){
                        send404(res);
                    }else{
                        cache[absPath] = data;
                        sendFile(res,absPath,data);
                    }
                })
            }else{
                send404(res);
            }
        })
    }
}

//http.createServer( function ( req, res ) {
//    if(req.url == '/'){
//        fs.readFile('./title.json', function ( err, data ) {
//            if(err){
//                console.log(err);
//                res.end('Server Error');
//            }
//        })
//    }
//})














