const Discord = require('discord.js');
const fs = require('fs');
const request = require('request');

module.exports = {
    name: 'graph',
    // aka: [''],
    description: 'Provide server Info using graph',
    guildOnly: true,
    args: true,
    usage: `<#> <username> <reason>`,
    async execute(msg, args, _, internal_error) {
        // const author = msg.member.displayName;
        // let server = args[0].replace(/server|s/i, '');
        // server = Number(server) || server;
        let channel = msg.channel;
        let msg = [];
        let type = 55;

        const download = (url, path, callback) => {
            request.head(url, (err, res, body) => {
              request(url).pipe(fs.createWriteStream(path)).on('close', callback)
            })
        }

        try {
            type = args[0].toLowerCase();
        } catch (e) {
            // pass
            channel.send(`Invalid argument provided.`)
            .catch((err) => {internal_error(err); return});
            console.log(`Graph - Invalid argument`);
        }

        try {
            if (isNaN(+type)) {
                switch (type) {
                    case 'load':
                        type = 4;
                        break;
                    case 'memory':
                        type = 7;
                        break;
                    case 'network':
                        type = 9;
                        break;
                    case 'disk':
                        type = 10;
                        break;
                    case 'usage':
                        type = 11;
                        break;
                    case 'cpu_temp':
                        type = 28;
                        break;
                    case 'cpu_freq':
                        type = 42;
                        break;
                    case 'cpu':
                        type = 51;
                        break;
                    case 'player':
                        type = 53;
                        break;
                    case 'ups':
                        type = 54;
                        break;
                    case 'rocket':
                        type = 55;
                        break;
                    default:
                        type = 54;
                }
            }
        } catch (e) {
            // pass
        }

        let url = 'https://info.explosivegaming.nl/grafana/render/d-solo/wRgzuFqiz/system-metrics?orgId=1&from=now-30m&to=now&panelId=' + type + '&width=1000&height=300&tz=UTC';
        const path = '.cache/graph.png'

        try {
            download(url, path, () => {
                console.log('Download Complete.');
            })
        } catch (e) {
            channel.send(`Error when saving image.`)
            .catch((err) => {internal_error(err); return});
            console.log(`Graph - Error when saving image`);
        }

        try {
            channel.send({files: ['.cache/graph.png']});
        } catch (e) {
            channel.send(`Error when sending image.`)
            .catch((err) => {internal_error(err); return});
            console.log(`Graph - Error when sending image`);
        }
    },
};
