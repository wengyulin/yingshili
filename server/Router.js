const path = require("path");
const fs = require("fs");
const qs = require('querystring');
const url = require('url');


//信号量
const {
    Query,
    } = require(path.resolve(__dirname, "..", "utils/SIGN.js"));


//路径
const PATHS = {
    app: path.resolve(__dirname, "..", "app", "index.jsx"),
    build: path.resolve(__dirname, "..", "build", "index.html"),
    public: path.resolve(__dirname, "..", "build")
};


/**
 *
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
        let statInfo = fs.statSync(PATHS.build);
        let regexpJS = /\.(js|jsx)$/;
        let regexpCSS = /\.(css)$/;
        let regexpImg = /\.(jpg|png)$/;
        let IncomingUrl = req.url;

        if (regexpJS.test(IncomingUrl)) {
            res.setHeader('Content-Type', 'application/x-javascript');
            res.setHeader('Server', 'huenchao');
            res.setHeader('X-Power-By', 'nodejs');
            res.writeHead(200, {});
            readStrem = fs.createReadStream(PATHS.public + IncomingUrl);
            readStrem.pipe(res);
            return;
        }
        if (regexpImg.test(IncomingUrl)) {
            let index = IncomingUrl.lastIndexOf(`.`);
            let ext = IncomingUrl.substr(index);
            res.setHeader('Content-Type', `image/${ext}`);
            res.setHeader('Server', 'huenchao');
            res.setHeader('X-Power-By', 'nodejs');
            res.writeHead(200, {});
            readStrem = fs.createReadStream(PATHS.public + IncomingUrl);
            readStrem.pipe(res);
            return;
        }
        if (regexpCSS.test(IncomingUrl)) {
            res.setHeader('Content-Type', 'text/css');
            res.setHeader('Server', 'huenchao');
            res.setHeader('X-Power-By', 'nodejs');
            res.writeHead(200, {});
            readStrem = fs.createReadStream(PATHS.public + IncomingUrl);
            readStrem.pipe(res);
            return;
        }

        if (statInfo) {
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Server', 'huenchao');
            res.setHeader('X-Power-By', 'nodejs');
            res.writeHead(200, {
                'Trailer': 'Content-MD5'
            });

            res.addTrailers({'Content-MD5': '7895bf4b8828b55ceaf47747b4bca667'});

            readStrem = fs.createReadStream(PATHS.build);
            readStrem.pipe(res);
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end("not found");
        }
    });
    return app;
}


module.exports = Router;






