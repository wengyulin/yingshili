const http = require("http");
const path = require("path");
const PATHS = {
    app: path.resolve(__dirname,"app", "index.jsx"),
    build: path.resolve(__dirname,"build", "index.html"),
    public: path.resolve(__dirname,"build")
};
const methods = ["GET", "POST", "HEAD", "TRACE", "CONNECT"];
const route = {};
const username = "1";
const password = "1";
let gift = "";


function app() {
    init();
    function handle(req, res) {
        let method = req.method;
        let len = route[method] && route[method].length > 0 ? route[method].length : 0;
        if (method == "POST") {
            for (let i = 0; i < len; i++) {
                if (route[method][i].path == req.url) {
                    route[method][i].fn[0](req, res);
                }
            }
        } else if (method == "GET") {
            route[method][0].fn[0](req, res);
        }
        process.send({cmd: 'notifyRequest'});
    }

    return http.createServer((req, res)=> {
        handle(req, res);
    });
}
function init() {
    //动态添加路由
    methods.forEach((method)=> {
        app[method] = function (path) {
            if (Object.prototype.toString.call(route[method]) === '[object Array]') {
                route[method].push({path, fn: Array.prototype.slice.call(arguments, 1)});
            } else {
                route[method] = [{path, fn: Array.prototype.slice.call(arguments, 1)}];
            }
        };
    });
}

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
        let verification = false; //验证
        postData = qs.parse(postData);
        let reback = {verifi: verification};
        if (postData.ID == username && postData.password == password) {
            reback.verifi = true;
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(reback));

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
        res.setHeader('X-Power-By', 'php/beta6.2');
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
        res.setHeader('X-Power-By', 'php/beta6.2');
        res.writeHead(200, {});
        readStrem = fs.createReadStream(PATHS.public + IncomingUrl);
        readStrem.pipe(res);
        return;
    }
    if (regexpCSS.test(IncomingUrl)) {
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Server', 'huenchao');
        res.setHeader('X-Power-By', 'php/beta6.2');
        res.writeHead(200, {});
        readStrem = fs.createReadStream(PATHS.public + IncomingUrl);
        readStrem.pipe(res);
        return;
    }

    if (statInfo) {
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Server', 'huenchao');
        res.setHeader('X-Power-By', 'php/beta6.2');
        res.writeHead(200, {});
        readStrem = fs.createReadStream(PATHS.build);
        readStrem.pipe(res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end("not found");
    }
});
exports.app = app;