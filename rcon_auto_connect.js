'use strict';
const rcon_client = require('rcon-client');
const rconpw = process.env.RCONPASS;
//Set up RCON connections for all servers.
/**
    @param {number} port The port to connect the rcon too.
    @param {number} port The id of the server the server will be called S + id.
    @returns {object} Object that contains send (to send commands) and connected (to check the connection).
*/
exports.rcon_connect = async function(port, i) {
    
    const client = new rcon_client.Rcon({
        host: 'localhost',
        port: port,
        password: rconpw,
    });

    let Iconnected = false;
    //Show commands sent and their reply for debugging
    let real_send = client.send;
    client.send = function(cmd) {
        return real_send.call(client, cmd).then(res => {
            if(!(client.socket && client.socket.writable && client.authenticated && Iconnected)){
                console.error(`[Rcon]: Not connected tried to send: ${cmd}`);
                return;
            }
            console.log(`S${i}`, cmd, '=>', res.slice(0, -1));
            return res;
        });
    };

    async function connect() {
        //Workaround for bug in rcon-client
        if (client.socket && !client.socket.writable && !client.authenticated) {
            client.socket = null;
        }

        //Atempt to connect to the Factorio server
        await client.connect().then(() => {
            console.log(`Connected to S${i}`);
            Iconnected = true;
            //Reconnect if the attempt failed
        }).catch(err => {
            Iconnected = false;
            console.log(`Connecting to S${i} failed:`, err.message);
            console.log('Reconnecting in 30 seconds');
            setTimeout(connect, 30e3).unref();
        });
    }

    client.on('end', function() {
        //Reconnect if a successfull connection was made.
        if (Iconnected) {
            console.log(`Lost connection with S${i}`);
            console.log('Reconnecting in 30 seconds');
            Iconnected = false;
            setTimeout(connect, 30e3).unref();
        }
    });

    client.on('error', function(err) {
        console.log(`Error on rcon for S${i}`, err.message);
    });
    await connect();
    return {
        send: client.send,
        get connected(){
            return client.socket && client.socket.writable && client.authenticated && Iconnected;
        }
    };
};