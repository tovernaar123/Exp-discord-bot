// @ts-check

let RconAutoConnect = require('./RconClass');
class RconManager {

    /**
     * @param {Number[]} OfflineList
     * @param {Number} MaxServerNum
     * @param {Number} BasePort
    */
    constructor(OfflineList, MaxServerNum, BasePort) {
        this.OfflineList = OfflineList;
        this.MaxServerNum = MaxServerNum;
        this.BasePort = BasePort;
        /**
         * @type {RconAutoConnect[]}
         * @readonly
        */
        this.Rcons = [];

    }

    /**
     * @param {Number} server
     * @returns {readonly RconAutoConnect}
    */
    GetRcon(server) {
        return this.Rcons[server];
    }
    /**
     * @returns {readonly RconAutoConnect[]}
    */
    GetAllRcons() {
        return this.Rcons;
    }

    async Connect() {
        // + 1 because we start at 1
        for (let i = 1; i < this.MaxServerNum + 1; i++) {
            if (this.OfflineList.includes(i)) {
                this.Rcons[i] = new RconAutoConnect(i, this.BasePort + i, process.env.RCONPASS);
            } else {
                let rcon = new RconAutoConnect(i, this.BasePort + i, process.env.RCONPASS);
                await rcon.Connect();
                this.Rcons[i] = rcon;
            }
        }
    }

}

module.exports = RconManager;