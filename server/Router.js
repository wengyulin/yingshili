const path = require("path");
const fs = require("fs");
const qs = require('querystring');
const url = require('url');
const crypto = require('crypto');
const net = require('net');

//信号量
const {
    Query,
    TCPconnected,
    TCPdisconnect
    } = require(path.resolve(__dirname, "..", "utils/SIGN.js"));


//路径
const PATHS = {
    app: path.resolve(__dirname, "..", "app", "index.jsx"),
    build: path.resolve(__dirname, "..", "build", "index.html"),
    public: path.resolve(__dirname, "..", "build")
};

//基本配置函数
const CONFIG = require(path.resolve(__dirname, "..", "utils/baseConfig.js"));

/**
 * 说明：需要加载URL接口，就写在这里
 *
 * */
function Router(app) {
    app.POST("/dolegift", (req, res)=> {
        let postData = "";
        req.on("data", data=> {
            postData += data;
        });

        req.on("end", ()=> {
            let verification = false; //验证
            postData = qs.parse(postData);
            let reback = {verifi: verification};
            (gift = postData.giftSort) ? (reback.verifi = true) : "";
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(reback));

        });

    });
    app.POST("/vipActivities", (req, res)=> {
        let postData = "";
        req.on("data", data=> {
            postData += data;
        });

        req.on("end", ()=> {
            let pool = app.pool;
            let verification = false; //验证
            let reback = {verifi: verification};


            postData = qs.parse(postData);

            pool.getConnection((err, connection)=> {
                //查询
                connection.query('select * from `users`', function (err, rows, fields) {
                    if (err) throw err;

                    if (postData.ID == rows[0][`userID`] && postData.password == rows[0][`password`]) {
                        reback.verifi = true;
                    }
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(reback));
                    process.send({
                        cmd: Query,
                        msg: `[child] 查询结果为=>${JSON.stringify(rows)}.`
                    });
                    connection.release();
                });
            });
        });
    });


    app.GET("/", (req, res)=> {
        res.setHeader('Server', 'huenchao');
        res.setHeader('X-Power-By', 'nodejs');

        let IncomingUrl = req.url;
        let pathName = url.parse(IncomingUrl).pathname;


        let hasExt = true;
        //对请求的路径进行解码，防止中文乱码
        pathName = decodeURI(pathName);


        //如果路径中没有扩展名
        if (path.extname(pathName) === '') {
            //如果不是以/结尾的，加/并作301重定向
            if (pathName.charAt(pathName.length - 1) != "/") {

                pathName += "/";
                let redirect = "http://" + request.headers.host + pathName;
                res.writeHead(301, {
                    location: redirect
                });
                res.end();
                return;
            }

            //添加默认的访问页面,但这个页面不一定存在,后面会处理
            pathName += "index.html";
            //标记默认页面是程序自动添加的
            hasExt = false;
        }

        //获取资源文件的相对路径
        let filePath = path.join(PATHS.public, pathName);


        //获取对应文件的文档类型
        let contentType = CONFIG.getContentType(filePath);


        //如果文件名存在
        fs.exists(filePath, (exists)=> {
            if (exists) {
                res.writeHead(200, {"content-type": contentType});
                var stream = fs.createReadStream(filePath, {flags: "r", encoding: null});

                stream.on("error", function () {
                    res.writeHead(500, {"content-type": "text/html"});
                    res.end("<h1>500 Server Error</h1>");
                });

                //返回文件内容
                stream.pipe(res);

            } else {
                //文件名不存在的情况
                if (hasExt) {
                    //如果这个文件不是程序自动添加的，直接返回404
                    res.writeHead(404, {"content-type": "text/html"});
                    res.end("<h1>404 Not Found</h1>");
                } else {
                    //如果文件是程序自动添加的且不存在，则表示用户希望访问的是该目录下的文件列表
                    var html = "<head><meta charset='utf-8'></head>";

                    try {
                        //用户访问目录
                        var filedir = filePath.substring(0, filePath.lastIndexOf('\\'));
                        //获取用户访问路径下的文件列表
                        var files = fs.readdirSync(filedir);
                        //将访问路径下的所以文件一一列举出来，并添加超链接，以便用户进一步访问
                        for (var i in files) {
                            var filename = files[i];
                            html += "<div><a  href='" + filename + "'>" + filename + "</a></div>";
                        }
                    } catch (e) {
                        html += "<h1>您访问的目录不存在</h1>"
                    }
                    res.writeHead(200, {"content-type": "text/html"});
                    res.end(html);
                }
            }
        });
    });

    /**
     *
     * 说明: 华为listos http接口
     *
     * */


    /*
     * *说明:控制开关
     *
     *
     * */
    app.POST("/todoSwitch", (req, res)=> {

        let chunk = "",
            reback = "";

        req.on("data", data=> {
            chunk += data;
        });

        req.on("end", ()=> {
            try {
                let postData = qs.parse(chunk),
                    pool = app.pool;

                pool.getConnection((err, connection)=> {
                    //查询
                    connection.query(`UPDATE devices SET status = ${postData.status} WHERE deviceID = ${postData.deviceID}`, function (err, rows, fields) {
                        if (err) throw err;
                        const client = net.connect({port: 6666, host: "10.1.17.9"}, () => {
                            // 'connect' listener
                            process.send({
                                cmd: TCPconnected,
                                msg: 'connected to server!'
                            });

                            client.write(`${chunk}\r\n`);
                        });

                        /**
                         * 说明： 0 成功 1失败
                         *
                         * */
                        client.on('data', (data) => {
                            process.send({
                                cmd: Query,
                                msg: data.toString()
                            });
                            res.end(JSON.stringify(
                                data.toString()
                            ));
                        });

                        client.on('end', () => {
                            process.send({
                                cmd: TCPdisconnect,
                                msg: `disconnected from server.`
                            });
                        });
                        connection.release();
                    });
                });
            } catch (e) {
                reback = {status: 0, msg: "失败"};
                res.end(JSON.stringify(reback));
            }
        });
    });

    /**
     * 说明：获取设备信息
     *
     *
     * */
    app.POST("/getDevices", (req, res)=> {

        let chunk = "",
            reback = "";

        req.on("data", data=> {
            chunk += data;
        });


        req.on("end", ()=> {
            try {
                let postData = qs.parse(chunk),
                    pool = app.pool;

                pool.getConnection((err, connection)=> {
                    //查询
                    connection.query(`select * from devices where userID =${postData.userID} `, function (err, rows, fields) {

                        if (err) throw err;

                        res.end(JSON.stringify(rows));
                        process.send({
                            cmd: Query,
                            msg: `[child] 查询结果为=>${JSON.stringify(rows)}.`
                        });
                        connection.release();
                    });
                });
            } catch (e) {
                reback = {status: 0, err: "数据格式不对"};
                res.end(JSON.stringify(reback));
            }
        });
    });

    /*
     * *
     *
     *
     *
     * */
    app.POST("/crypto", (req, res)=> {

        try {
            const cert = crypto.Certificate();
            let chunk = "";

            req.on("data", data=> {
                chunk += data;
            });


            req.on("end", ()=> {
                let postData = qs.parse(chunk);
                const spkac = postData[`key`];
                const challenge = cert.exportChallenge(spkac);
                res.end(123);
            });
        } catch (err) {
            process.send({
                cmd: Query,
                msg: 'crypto support is disabled!'
            });
            res.end(JSON.stringify({cmd: "fail"}));
        }

    });

    return app;
}


module.exports = Router;






