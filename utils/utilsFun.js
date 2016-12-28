/**
 * Utilities
 **/

var numReqs = 0;

// Keep track of http requests
const track4Reqs = ()=> {
    process.nextTick(()=> {
        console.log('numReqs =', numReqs);
    });
};
exports.track4Reqs = track4Reqs;


const say = (message) => {
    console.log("[SERVER] " + message);
};

exports.say = say;

function messageHandler (msg){
    if (msg.cmd && msg.cmd == 'notifyRequest') {
        say(`The worker #${this.id} is working.It's pid is #${this.process.pid}`);

    } else if (msg.cmd && msg.cmd == 'online') {
        say(msg.msg);
    }else if(msg.cmd && msg.cmd == 'offline'){

        say(msg.msg);
    }
}

exports.messageHandler = messageHandler;