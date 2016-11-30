const http = require("http");
const path = require("path");
const fs = require("fs");

const PATHS = {
    app: path.resolve(__dirname, "app", "index.jsx"),
    build: path.resolve(__dirname, "build", "index.html"),
    public: path.resolve(__dirname, "build")
};

const sever = http.createServer((req, res)=> {

    let statInfo = fs.statSync(PATHS.build);
    let regexpJS = /\.(js|jsx)$/;
    let IncomingUrl = req.url;

    if (regexpJS.test(IncomingUrl)) {
        res.setHeader('Content-Type', 'text/plain');
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


sever.listen(3000, ()=> {

    console.log("服务开启")
});