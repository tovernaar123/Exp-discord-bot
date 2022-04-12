let RconLibrary = require('rcon-client');
class Rcon {
    constructor(server, port, password) {
        this.port = port;
        this.server = server;
        this.password = password;
        this.HasSendReconnectMsg = false;

        this.client = new RconLibrary.Rcon({ host: 'localhost', port: this.port, password: this.password });
        
        this.client.on('end', this.LostConnection);

        this.client.on('error', (err) => {
            console.log(`Error on rcon for S${this.server}`, err.message);
        });
    }

    async Connect() {
        //bug in the rcon client (it would not connected after a lost connection).
        if (this.client.socket && !this.client.socket.writable && !this.client.authenticated) {
            this.client.socket = null;
        }
        try {
            await this.client.connect();
            console.log(`Connected to S${this.server}`);
        } catch (err) {
            this.LostConnection(err);
        }


    }

    async LostConnection(err) {

        if (err.code !== 'ECONNREFUSED') {
            console.error(`[Rcon]: Connecting to S${this.server} failed:`, err.message);
            console.error('Reconnecting in 30 seconds');
        } else if (!this.HasSendReconnectMsg) {
            console.log(`[Rcon]: Could not connect to S${this.server} (ECONNREFUSED)`);
            console.log('Reconnecting in 30 seconds');
            this.HasSendReconnectMsg = true;
        }

        setTimeout(this.connect, 30e3);
    }

    async Send(cmd) {
        if (!(this.connected)) {
            console.error(`[Rcon]: Not connected tried to send: ${cmd}`);
            return;
        }

        try {
            let res = this.client.send(cmd);
            console.log(`S${this.server}`, cmd, '=>', res.slice(0, -1));
        } catch (err) {
            console.error(`[Rcon]: Error sending command: ${cmd}`, err);
        }

    }

    get connected() {
        return this.client?.socket && this.client?.socket?.writable && this.client?.authenticated;
    }
}
module.exports = Rcon;