const fs = require('fs');
const request = require('request');
let Discord_Command = require('./../command.js');

const download = (url, path, callback) => {
    request.head(url, () => {
        request(url).pipe(fs.createWriteStream(path)).on('close', callback);
    });
};

class Graph extends Discord_Command {
    constructor() {
        let args = [
            {
                name: 'type',
                type: 'Integer',
                required: true,
                description: 'The type of graph to display.',
                choices: [
                    ['load', 4],
                    ['memory', 7],
                    ['network', 9],
                    ['disk', 10],
                    ['usage', 11],
                    ['cpu_temp', 28],
                    ['cpu_freq', 42],
                    ['cpu', 51],
                    ['player', 54],
                    ['ups', 55],
                    ['rocket', 56],
                ]
            }
        ];
        super({
            name: 'graph',
            aka: ['adminsonline'],
            description: 'Get the amount of admins online on the servers.',
            cooldown: 5,
            args: args,
            guildOnly: true
        });
        this.cache_time = {};
    }

    async execute(interaction) {
        await interaction.deferReply();

        let type = interaction.options.getInteger('type');
        let url = `https://info.explosivegaming.nl/grafana/render/d-solo/wRgzuFqiz/system-metrics?orgId=1&from=now-30m&to=now&panelId=${type}&width=1000&height=300&tz=UTC`;
        const path = `.cache/graph${type}.png`;

        await interaction.editReply('Downloading graph please wait...');
        if(this.cache_time[type] && (this.cache_time[type] > Date.now() - 3*60*1000) && fs.existsSync(path)) {
            await interaction.editReply({ content: 'from cache (clear every 3 min): ', files: [path] });
        } else {

            try {
                download(url, path, async () => {
                    console.log('Download Complete.');
                    await interaction.editReply({ content: 'downloaded: ', files: [path] });
                });
            } catch (e) {
                await interaction.editReply('Error when saving image.');
                console.log('Error when saving graph image.');
            }
            this.cache_time[type] = Date.now();
        }
    }
}
let command = new Graph();
module.exports = command;