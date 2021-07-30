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
        let message = [];

        let server = args[0]  || 'all';

        if (server) {
            if (isNaN(+server)) {
                // Server is word
                server =  server.replace('/server/i', '').replace('/s/i', '');
            } else {
                // Type is number
                if (server < 1 || server > 8) {
                    msg.channel.send(`Error: Lookup out of range.`);
                    server = -1;
                }
            }
        }

        /*
        As a cycle:
        S1: 48 hours or 2 days
        S3: 168 hours or 7 days
        S4: 672 hours or 28 days

        Time of reset:
        S1: 16
        S3: 22
        S4: 8
        */

        // [Server Number, Init Date, Cycle Duration, Reset at hour time]
        // Ordered by S1, S3, S4

        let reset = [['1', new Date(2021, 6, 23).getTime(), 2, 16], 
        ['3', new Date(2021, 6, 23).getTime(), 7, 22],
        ['4', new Date(2021, 6, 19).getTime(), 28, 8]];
        let day_ms = 86400000;
        let time_offset = (new Date()).getTimezoneOffset() * 60000;
        let date_today = Date.now();
        
        message.push('Next Map Reset');

        for (let i = 0; i < reset.length; i++) {
            if (server == reset[i][0] || server == 'all') {
                // Day Difference
                diff = Math.ceil((date_today + time_offset - reset[i][1]) / day_ms) % reset[i][2];

                if (diff == 0) {
                    message.push('S' + reset[i][0] +' resets today, at ' + reset[i][3] + ':00 UTC');
                } else if ((reset[i][2] - diff) == 1) {
                    message.push('S' + reset[i][0] +' resets tomorrow, at ' + reset[i][3] + ':00 UTC');
                } else {
                    message.push('S' + reset[i][0] +' reset in ' + (reset[i][2] - diff) + ' day, at ' + reset[i][3] + ':00 UTC');
                }
            }
        }
        
        msg.channel.send(message.join('\n'));
    },
};
