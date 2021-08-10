const Discord = require('discord.js');

module.exports = {
    name: 'serverreset',
    aka: ['sr', 'reset'],
    description: 'Get next server reset info',
    guildOnly: true,
    args: true,
    usage: ` <server#>`,
    async execute(msg, args, _, internal_error) {
        let channel = msg.channel;
        let author = msg.author.displayName;
        let msg_2 = [];
        let server = args[0] || 'all';

        if (isNaN(server)) {
            // Server is word
            server =  server.replace('/server/i', '').replace('/s/i', '');
        } 
        
        if (server < 1 || server > 8) {
            channel.send({content: `Error: Lookup out of range.`});
            server = -1;
        }

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

        let reset = [['1', new Date(2021, 6, 23).getTime(), 2, 16], 
        ['3', new Date(2021, 6, 23).getTime(), 7, 22],
        ['4', new Date(2021, 6, 19).getTime(), 28, 8]];
        let day_ms = 86400000;
        let time_offset = (new Date()).getTimezoneOffset() * 60000;
        let date_today = Date.now();

        msg_2.push('Next Map Reset');

        for (let i = 0; i < reset.length; i++) {
            if (server == reset[i][0] || server == 'all') {
                // Day Difference
                let diff = Math.ceil((date_today + time_offset - reset[i][1]) / day_ms) % reset[i][2];

                if (diff == 0) {
                    let min = Math.ceil((date_today % day_ms + time_offset - reset[i][3] * 3600000) / 60000);
                    
                    if (min < 0) { 
                        min = 1440 + min;
                    }

                    msg_2.push('S' + reset[i][0] +' resets today, at ' + reset[i][3] + ':00 UTC (' + Math.ceil(min / 60) + ' h ' + min % 60 + ' m)');
                } else if ((reset[i][2] - diff) == 1) {
                    msg_2.push('S' + reset[i][0] +' resets tomorrow, at ' + reset[i][3] + ':00 UTC');
                } else {
                    msg_2.push('S' + reset[i][0] +' resets in ' + (reset[i][2] - diff) + ' day, at ' + reset[i][3] + ':00 UTC');
                }
            }
        }
        
        channel.send({content: msg_2.join('\n')});
    },
};
