let Rcon = require('./RconClass');
class RconManager {

    constructor(OfflineList, MaxServerNum, BasePort) {
        this.OfflineList = OfflineList;
        this.MaxServerNum = MaxServerNum;
        this.BasePort = BasePort;
        this.Rcons = [];

    }

    async GetRcon(server) {
        return this.Rcons[server];
    }

    async SetOfflineList(NewList) {
        let added = NewList.map((server) => {
            if (!this.OfflineList.includes(server)) return server;
        });

        let removed = this.OfflineList.map((server) => {
            if (!NewList.includes(server)) return server;
        });
        //added the newly added once and remove the removed once
        console.log(added);
        console.log(removed);
    }


    async Connect() {
        // + 1 because we start at 1
        for (let i = 1; i < this.MaxServerNum + 1; i++) {
            if (this.OfflineList.includes(i)) {
                this.Rcons[i] = { 'connected': false };
            } else {
                this.Rcons[i] = new Rcon(i, this.BasePort + i, process.env.RCONPASS);
                await this.Rcons[i].Connect();
            }
        }
    }

}

module.exports = RconManager;