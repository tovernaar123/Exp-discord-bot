// @ts-check
let RconLibrary = require('rcon-client');
class RconAutoConnect {


    /**
     * 
     * @constructor
     * @param {Number} server 
     * @param {Number} port 
     * @param {String} password 
     */

    constructor(server, port, password) {
        this.port = port;
        this.server = server;
        this.password = password;

        this.HasSendReconnectMsg = false;

        this.client = new RconLibrary.Rcon({ host: 'localhost', port: this.port, password: this.password });

        this.client.on('end', () => {
            setTimeout(() => { this.Connect(); }, 30e3);
        });

        this.client.on('error', (err) => {
            this.LostConnection(err);
        });
    }


    async Connect() {
        //bug in the rcon client (it would not connected after a lost connection).
        if (this.client.socket && !this.client.socket.writable && !this.client.authenticated) {
            this.client.socket = null;
        }
        try {
            await this.client.connect();
            console.log(`[Rcon]: Connected to S${this.server}`);
        } catch (err) {
            this.LostConnection(err);
            setTimeout(() => { this.Connect(); }, 30e3);
        }
        this.Connecting = false;

    }

    /**
     * @private
     * @param {{ code: string; message: string; }} err     
    */
    async LostConnection(err) {

        if (err?.code !== 'ECONNREFUSED') {
            console.error(`[Rcon]: Connecting to S${this.server} failed:`, err?.message);
            console.error(`[Rcon]: Reconnecting to S${this.server} in 30 seconds.`);
        } else if (!this.HasSendReconnectMsg) {
            console.log(`[Rcon]: Could not connect to S${this.server} (ECONNREFUSED)`);
            console.log(`[Rcon]: Reconnecting to S${this.server} in 30 seconds.`);
            this.HasSendReconnectMsg = true;
        }

    }

    /**
     * @param {string} cmd
     */
    async Send(cmd) {
        if (!(this.connected)) {
            console.error(`[Rcon]: Not connected tried to send: ${cmd}`);
            return;
        }

        let res;
        try {
            res = await this.client.send(cmd);
            console.log(`[Rcon]: S${this.server}`, cmd, '=>', res.slice(0, -1));
        } catch (err) {
            console.error(`[Rcon]: Error sending command: ${cmd}`, err);
        }
        return res;
    }

    get connected() {
        return this.client?.socket && this.client?.socket?.writable && this.client?.authenticated;
    }
}
module.exports = RconAutoConnect;