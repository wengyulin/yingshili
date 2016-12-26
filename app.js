const cluster = require('cluster');
const path = require('path');
const {say,messageHandler} = require(path.resolve(__dirname, "utils/utilsFun.js"));
const {SHOTDOWN} = require(path.resolve(__dirname, "utils/SIGN.js"));
const numCPUs = require('os').cpus().length;


/**
 * Startup Messaging
 **/
say("Master starting:");
say("pid         => " + process.pid);
say("environment => " + process.env.NODE_ENV);


cluster.setupMaster({
    exec: path.resolve(__dirname, 'worker.js'),
    args: ['--use', 'http'],
    silent: true
});


// Start workers and listen for messages containing notifyRequest
for (let i = 0; i < numCPUs; i++) {
    let worker = cluster.fork();
/*    let timeout;

    worker.on('listening', (address) => {
        worker.send(SHOTDOWN);
        worker.disconnect();
        timeout = setTimeout(() => {
            worker.kill();
        }, 2000);
    });

    worker.on('disconnect', () => {
        clearTimeout(timeout);
    });*/

}


Object.keys(cluster.workers).forEach((id) => {
    let worker = cluster.workers[id];
    worker.on('message', messageHandler.bind(worker));
});


/**
 * Worker Event Handlers
 **/


    //fork的时候触发
cluster.on('online', worker => {
    say('worker      => start with pid: ' + worker.process.pid + '.');
});

//当有一个进程执行listen()的时候
cluster.on('listening', (worker, address)=> {
    say(`A work with # ${worker.process.pid} is now connect to :  ${JSON.stringify(address)}`);
});

//退出一个，打印日志，重启一个新的。
cluster.on('exit', (worker, code, signal) => {
    if (worker.exitedAfterDisconnect === true) {
        say('Oh, it was just voluntary – no need to worry');

    } else if (code !== 0) {
        console.log('Error occurred --- #%s', code);
    } else {
        say("The signal is %s", signal);
    }
    say('worker      => with pid: ' + worker.process.pid + ', died. Restarting...');
    cluster.fork();
});



