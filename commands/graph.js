const Discord = require('discord.js');
const fs = require('fs');
const request = require('request');

function graph_type_select(type) {
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
    return type;
}

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
        let type = args[0].toLowerCase();

        //board
        let role_needed = "693500936491892826";
        let role = await msg.guild.roles.fetch(role_needed);
        let allowedThisCommand = msg.member.roles.highest.comparePositionTo(role) >= 0;
        let graph_index_list = [4, 7, 9, 10, 11, 28, 42, 51, 53, 54, 55];
        let graph_index_allowed = [53, 54, 55];

        if (type) {
            if (isNaN(+type)) {
                // Type is word
                type = graph_type_select(type)
            } else {
                // Type is number
                if (graph_index_list.indexOf(type) < 0) {
                    channel.send(`Error: Lookup out of range.`);
                    type = -1;
                }
            }
            
            if (!allowedThisCommand) {
                if (graph_index_allowed.indexOf(type) < 0) {
                    channel.send(`Error: Unauthorized use of advanced graph usage.`);
                    type = -1;
                }
            }
        } else {
            type = 54;
        }

        if (type >= 0) {
            const download = (url, path, callback) => {
                request.head(url, (err, res, body) => {
                  request(url).pipe(fs.createWriteStream(path)).on('close', callback);
                })
            }

            let url = 'https://info.explosivegaming.nl/grafana/render/d-solo/wRgzuFqiz/system-metrics?orgId=1&from=now-30m&to=now&panelId=' + type + '&width=1000&height=300&tz=UTC';
            const path = '.cache/graph.png'
    
            try {
                download(url, path, () => {
                    console.log('Download Complete.');
                })
            } catch (e) {
                channel.send(`Error when saving image.`);
                console.log(`Error when saving graph image.`);
            }
    
            try {
                channel.send({files: ['.cache/graph.png']});
            } catch (e) {
                channel.send(`Error when sending image.`);
                console.log(`Error when saving graph image.`);
            }
        }
    },
};
