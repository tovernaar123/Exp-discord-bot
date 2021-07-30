const Discord = require('discord.js');

module.exports = {
    name: 'serverreset',
    aka: ['sr', 'reset'],
    description: 'Get next server reset info',
    guildOnly: true,
    args: true,
    usage: ` <server#>`,
    async execute(msg, args, _, internal_error) {
        const author = msg.author.displayName;
        let server = args[0];

        if (server) {
            if (isNaN(+server)) {
                // Server is word
                server =  server.replace('/server/i', '').replace('/s/i', '');
            } else {
                // Type is number
                if (server < 1 || server > 8) {
                    channel.send(`Error: Lookup out of range.`);
                    server = -1;
                }
            }
        }

        let message = [];

        /*
        As a cycle:
        S1: 48 hours or 2 days
        S3: 168 hours or 7 days
        S4: 672 hours or 28 days

        Time:
        S1: 16
        S3: 22
        S4: 8
        */

        // [Init Date, Cycle Duration, Reset at hour time]
        // Order:
        // S1, S3, S4
        
        let reset = [[new Date(2021, 6, 23).getTime(), 2, 16], 
        [new Date(2021, 6, 23).getTime(), 7, 22],
        [new Date(2021, 6, 19).getTime(), 28, 8]];
        let day_ms = 86400000;
        let time_offset = (new Date()).getTimezoneOffset() * 60000;
        let date_today = Date.now();

        // Day Difference
        diff = [Math.ceil((date_today + time_offset - reset[0][0]) / day_ms) % reset[0][1], 
        Math.ceil((date_today + time_offset - reset[1][0]) / day_ms) % reset[1][1], 
        Math.ceil((date_today + time_offset - reset[2][0]) / day_ms) % reset[2][1]];

        message.push('Next Map Reset Date');

        if (server == '1' || server == 'all') {
            if (diff[0] == 0) {
                message.push('S1 reset in today, at ' + reset[0][2] + ':00');
            } else {
                message.push('S1 reset in ' + (reset[0][1] - diff[0]) + ' day, at ' + reset[0][2] + ':00');
            }
        }

        if (server == '3' || server == 'all') {
            if (diff[1] == 0) {
                message.push('S3 reset in today, at ' + reset[1][2] + ':00');
            } else {
                message.push('S3 reset in ' + (reset[1][1] - diff[1]) + ' day, at ' + reset[1][2] + ':00');
            }
        }

        if (server == '4' || server == 'all') {
            if (diff[2] == 0) {
                message.push('S4 reset in today, at ' + reset[2][2] + ':00');
            } else {
                message.push('S4 reset in ' + (reset[2][1] - diff[2]) + ' day, at ' + reset[2][2] + ':00');
            }
        }
        
        msg.channel.send(message.join('\n'));
    },
};
