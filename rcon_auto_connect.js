"use strict";
const rcon_client = require("rcon-client");
const rconpw = process.env.RCONPASS;
//Set up RCON connections for all servers.
/**
    @param {number} port The port to connect the rcon too.
    @param {number} port The id of the server the server will be called S + id.
    @returns {object} Object that contains send (to send commands) and connected (to check the connection).
*/
exports.rcon_connect = async function(port, i) {
    const client = new rcon_client.Rcon({
        host: "localhost",
        port: port,
        password: rconpw,
    });

    //Show commands sent and their reply for debugging
    let real_send = client.send;
    client.send = function(cmd) {
        return real_send.call(client, cmd).then(res => {
            console.log(`S${i}`, cmd, "=>", res.slice(0, -1));
            return res;
        });
    };

    let connected = false;
    async function connect() {
        //Workaround for bug in rcon-client
        if (client.socket && !client.socket.writeable && !client.authenticated) {
            client.socket = null;
        }

        //Atempt to connect to the Factorio server
        await client.connect().then(() => {
            console.log(`Connected to S${i}`);
            connected = true;
            //Reconnect if the attempt failed
        }).catch(err => {
            console.log(`Connecting to S${i} failed:`, err.message);
            console.log("Reconnecting in 10 seconds");
            setTimeout(connect, 10e3).unref();
        });
    }

    client.on("end", function() {
        //Reconnect if a successfull connection was made.
        if (connected) {
            console.log(`Lost connection with S${i}`);
            console.log("Reconnecting in 10 seconds");
            connected = false;
            setTimeout(connect, 10e3).unref();
        }
    });

    client.on("error", function(err) {
        console.log(`Error on rcon for S${i}`, err.message);
    });
    await connect();
    return {
        send: client.send,
        connected: connected
    }
};