const Discord = require('discord.js');
const fs = require('fs');
const puppeteer = require('puppeteer');

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
        let type = args[0] || 55;
        type = type.toString().toLowerCase();

        //board
        let role_needed = role.board;
        let role = await msg.guild.roles.fetch(role_needed);
        let allowedThisCommand = msg.member.roles.highest.comparePositionTo(role) >= 0;

        let graph_list_standard = ['54', '55', '56'];
        let graph_list = ['4', '7', '9', '10', '11', '28', '42', '51', '54', '55', '56'];
        let graph_dict = {
            'load':'4',
            'memory':'7',
            'network':'9',
            'disk':'10',
            'usage':'11',
            'cpu_temp':'28',
            'cpu_freq':'42',
            'cpu':'51',
            'player':'54',
            'ups':'55',
            'rocket':'56'
        };

        
        if (isNaN(type)) {
            // Type is word
            if (graph_dict.hasOwnProperty(type)) {
                type = graph_dict[type];
            } else {
                channel.send({content: `Error: Lookup out of range.`});
            }
        } else {
            // Type is number
            if (graph_list.indexOf(type) < 0) {
                channel.send({content: `Error: Lookup out of range.`});
                type = -1;
            }
        }
            
        if (!allowedThisCommand) {
            if (graph_list_standard.indexOf(type) < 0) {
                channel.send({content: `Error: Unauthorized use of other graph usage.`});
                type = -1;
            }
        }

        if (type >= 0) {
            let url = 'https://info.explosivegaming.nl/grafana/render/d-solo/wRgzuFqiz/system-metrics?orgId=1&from=now-30m&to=now&panelId=' + type + '&width=1000&height=300&tz=UTC';
    
            try {
                (async () => {
                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();
                    await page.goto(url);
                    await page.screenshot({path: './graph.png'});
                    await browser.close();
                    })();
            } catch (e) {
                channel.send({content: `Error when saving image.`});
                console.log({content: `Error when saving graph image.`});
            }
    
            try {
                channel.send({files: ['./graph.png']});
            } catch (e) {
                channel.send({content: `Error when sending image.`});
                console.log(`Error when sending image.`);
            }
        }
    },
};
