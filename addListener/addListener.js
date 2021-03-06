//http协议模块
const http = require("http");

//https协议模块
const https = require("https");

//路径解析模块
const path = require("path");
//文件系统模块
const fs = require("fs");
//url解析模块
const url = require('url');

const net = require('net');
const mysql = require('mysql');



const addEventListener = (app)=> {

    const server = app.httpServer;

    server.on('request', (req, res)=> {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('https web');
    });


    /**
     * 说明：创建服务器的第二种写法
     * 有关server对象的事件监听
     * @param {Object} req 是http.IncomingMessag的一个实例，在keep-alive连接中支持多个请求
     * @param {Object} res 是http.ServerResponse的一个实例
     */

    server.on('request', (req, res)=> {
        handle(req, res);
    });
    /**
     * 说明：每当收到Expect: 100-continue的http请求时触发。 如果未监听该事件，服务器会酌情自动发送100 Continue响应。
     *
     * 注意：当这个'checkContinue'触发 并且 处理了，'request'事件不会触发
     *
     * 处理该事件时，如果客户端可以继续发送请求主体则调用response.writeContinue， 如果不能则生成合适的HTTP响应（例如，400 请求无效）
     * 需要注意到, 当这个事件触发并且被处理后, request 事件将不再会触发.
     * @param {Object} req
     * @param {Object} req
     */
    server.on('checkContinue', (req, res) => {
        //这里需要处理一些特别的事情
        if (res.url) {
            res.writeContinue();
        } else {
            res.writeHead(400, {'Content-Type': 'text/plain;charset="UTF-8"'});
            res.end('check your proxy, Bad Request');
        }
    });

    /**
     * 说明：如果客户端发起connect请求，如果服务器端没有监听，那么于客户端请求的该连接将会被关闭,
     *
     * 注意： 客户端和服务器都要对这个事件监听处理，不然和说明一样，相对于客户端亦然
     *
     * @param {Object} req 是该HTTP请求的参数，与request事件中的相同。
     * @param {Object} socket 是服务端与客户端之间的网络套接字。需要自己写一个data事件监听数据流
     * @param {Object} head 是一个Buffer实例，隧道流的第一个包，该参数可能为空。
     */

    /*
     *
     *  这是一个反向代理
     * */
    server.on('connect', (req, cltSocket, head)=> {
        var srvUrl = url.parse(`http://${req.url}`);
        var srvSocket = net.connect(srvUrl.port, srvUrl.hostname, () => {
            //发给target web
            srvSocket.write(head);
            srvSocket.pipe(cltSocket);

            // 返回 client
            cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                'Proxy-agent: Node.js-Proxy\r\n' +
                '\r\n');
            cltSocket.pipe(srvSocket);
        });
    });


    /**
     * 说明，当 `clientError` 发生的时候，req和res是没有的，所以你需要将response header和 preload都
     * 定向到socket中，让他返回，然后注意http message的格式
     * @param {Object} err
     * @param {Object} socket
     *
     * */
    server.on('clientError', (err, socket) => {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
//主进程发送消息过来了。
    process.on('message', (msg) => {
        if (msg === SHOTDOWN) {
            pool.end((err)=> {
                // all connections in the pool have ended
                if (err) {
                    process.send({
                        cmd: ErrorMysql,
                        msg: `error connecting:  ${err.stack}.`
                    });
                }
            });

            //关闭服务器
            server.close(()=> {
                process.send({
                    cmd: OFFLINE,
                    msg: "initiate graceful close of any connections to server"
                });

            })
        }
    });
    /**
     * 源API: Event: 'close'
     * 说明：关闭服务器时触发
     */
    server.on('close', () => {
        process.send({
            cmd: ALREADYLINE,
            msg: "the web server is closed!-----[worker]" + new Date().toLocaleDateString()
        });

    });

    /**
     * 说明：最大请求头数目限制, 默认 1000 个. 如果设置为0, 则代表不做任何限制.
     * @type {number}
     */
    server.maxHeadersCount = 1000;


    /**
     * 说明：这个事件主要是对HTTP协议升级为其他协议后的事件监听，如果服务器端没有监听，那么于客户端请求的该连接将会被关闭
     * @param {Object} req 是该HTTP请求的参数，与request事件中的相同。
     * @param {Object} socket 是服务端与客户端之间的网络套接字。需要自己写一个data事件监听数据流
     * @param {Object} head 是一个Buffer实例，升级后流的第一个包，该参数可能为空。
     */
    server.on('upgrade', (req, socket, head)=> {

        if (req.httpVersion == "1.0") {
            socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
                'Upgrade: WebSocket\r\n' +
                'Connection: Upgrade\r\n' +
                '\r\n');
        } else {
            socket.end();
        }
        socket.on("data", (chunk)=> {
            socket.write("发送服务器的消息");
        });
        socket.on("end", ()=> {
            socket.write("发送服务器的消息");
            socket.end();
            if (!socket.destroyed) {
                console.log(" socket.end 会销毁socket,不信你可以执行end，看会不会进入这个方法");
                if (socket.destroy) {
                    socket.destroy();
                    console.log(!socket.destroyed)
                }

            }
        });
    });
    /**
     * 源API：server.setTimeout(msecs, callback)
     * 说明：为套接字设定超时值。如果一个超时发生，那么Server对象上会分发一个'timeout'事件，同时将套接字作为参数传递。
     * 设置为0将阻止之后建立的连接的一切自动超时行为
     * @param {Number} msecs
     * @param {Func} callback
     * @return server
     */

//官网文档给出的解释是：Sets the timeout value for sockets, and emits a 'timeout' event on the Server object, passing the socket as an argument, if a timeout occurs.

    server.setTimeout(60000, (socket)=> {

        !socket.destroyed && socket.destroy && socket.destroy();

    });
    /**
     * 说明：一个套接字被判断为超时之前的闲置毫秒数。 默认 120000 (2 分钟) ,超时2分钟的话 sockets 就会自动销毁
     * 注意1： socket timeout 这个逻辑是在已经建立了链接的基础上设置的。所以它只对新进来的链接有效，已经存在的无效。.
     * 注意2:改成0表示不会timeout
     *
     * @type {number}
     */
    server.timeout = 120000;


    /**
     * 说明：这里的主机将是本地
     * @param {Number} port 端口
     * @param {Function} callback 异步回调函数
     */


    server.listen(config.port, config.ip, ()=> {
        process.send({
            cmd: ONLINE,
            msg: `[child] =>${process.pid} 上线了....`
        });

    });

};

module.exports = addEventListener;