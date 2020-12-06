function log_message_time(msg_2){
    msg_2 = msg_2.split('\n');
    var msg_3 = '';
    var msg_4 = [];
    var msg_5 = [];
    var msg_6 = [];
    var msg_9 = [];
    var msg_10 = '';
    var msg_11 = ['Sessions:'];

    for (let i = 0; i < msg_2.length; i++) {
        // should only accept JOIN LEAVE pattern here
        if (msg_2[i].indexOf('[JOIN]') != -1 || msg_2[i].indexOf('[LEAVE]') != -1) {
            msg_3 = msg_2[i];
            msg_3 = msg_3.replace(' joined the game', '');
            msg_3 = msg_3.replace(' left the game', '');
            msg_3 = msg_3.split(' ');
            msg_4.push(msg_3);
            msg_5.push(msg_3[3]);
        }
    }

    // Name list unique
    msg_5 = Array.from(new Set(msg_5));

    for (let i = 0; i < msg_5.length; i++) {
        var msg_7 = [];
        var msg_8 = '';

        for (let j = 0; j < msg_4.length; j++) {
            if (msg_4[j][3] == msg_5[i]){
                // Expect a JOIN LEAVE pattern
                // reject JOIN LEAVE *LEAVE* JOIN
                // there should be no double JOIN
                if (msg_8 != msg_4[j][2]) {
                    msg_7.push([msg_4[j][0], msg_4[j][1], msg_4[j][2]]);
                    msg_8 = msg_4[j][2];
                }
            }
        }

        msg_6.push([msg_5[i], msg_7])
    }

    for (let i = 0; i < msg_6.length; i++) {
        for (let j = 0; j < msg_6[i][1].length/2; j++){
            var k = 2 * j
            var flag = 0;

            if (j == 0) {
                if (msg_6[i][1][0][2] == '[LEAVE]') {
                    flag = 1;
                }
            } else if (k == msg_6[i][1].length) {
                if (msg_6[i][1][k][2] == '[JOIN]') {
                    flag = 1;
                }
            }
            
            if (flag == 0) {
                try {
                    var j1 = msg_6[i][1][k][0];
                    var l1 = msg_6[i][1][k+1][0];
                    var j2 = msg_6[i][1][k][1].split(':');
                    var l2 = msg_6[i][1][k+1][1].split(':');
    
                    // Jan is month 0
                    var j3 = new Date(j1.substr(0, 4), j1.substr(5, 2)-1, j1.substr(8, 2), j2[0], j2[1], j2[2]);
                    var l3 = new Date(l1.substr(0, 4), l1.substr(5, 2)-1, l1.substr(8, 2), l2[0], l2[1], l2[2]);
                    var t3 = (l3-j3) / 1000;
        
                    msg_9.push([msg_6[i][0], j1.substr(0, 4)+"-"+j1.substr(5, 2)+"-"+j1.substr(8, 2), j2[0]+':'+j2[1]+':'+j2[2], t3])
        
                } catch(e) {
                    // pass
                    // console.log(e)
                }
            }
        }
    }

    for (let i = 0; i < msg_9.length; i++) {
        var h3 = Math.floor(msg_9[i][3] % 216000 / 3600);
        var m3 = Math.floor(msg_9[i][3] % 3600 / 60);
        var s3 = msg_9[i][3] % 60;

        if (msg_10 != msg_9[i][0]) {
            // New user
            msg_10 = msg_9[i][0];
            msg_11.push('\n' + msg_9[i][0] + ':')
        }
        
        const pad = (num, places) => String(num).padStart(places, '0')
        
        // OOO was online for 0 hrs 20 minutes on 2020-12-05.

        if (h3 > 0) {
            // msg_11.push(msg_9[i][1] + ' ' + msg_9[i][2] + ' - ' + h3 + ' hrs ' + m3 + ' min ' + s3 + ' sec.')
            msg_11.push(msg_9[i][1] + ' ' + msg_9[i][2] + ' - ' + pad(h3, 2) + ':' + pad(m3, 2) + ':' + pad(s3, 2))
            //    msg_11.push(msg_9[i][0] + ' was online for ' + h3 + ' hr ' + m3 + ' min ' + s3 +' sec on ' + msg_9[i][1])
        } else if (m3 > 0) {
            msg_11.push(msg_9[i][1] + ' ' + msg_9[i][2] + ' - ' + pad(h3, 2) + ':' + pad(m3, 2) + ':' + pad(s3, 2))
            // msg_11.push(msg_9[i][1] + ' ' + msg_9[i][2] + ' - ' + m3 + ' min ' + s3 + ' sec.')
            // msg_11.push(msg_9[i][0] + ' was online for ' + m3 + ' min ' + s3 +' sec on ' + msg_9[i][1])
        } else {
            msg_11.push(msg_9[i][1] + ' ' + msg_9[i][2] + ' - ' + pad(h3, 2) + ':' + pad(m3, 2) + ':' + pad(s3, 2))
            // msg_11.push(msg_9[i][1] + ' ' + msg_9[i][2] + ' - ' + s3 + ' sec.')
            // msg_11.push(msg_9[i][0] + ' was online for ' + s3 +' sec on ' + msg_9[i][1])
        }

    }

    msg_11 = msg_11.join('\n')

    return msg_11
}

const readLastLines = require(`read-last-lines`);

async function get_logs(server, size, msg) {  
    readLastLines.read(`/home/factorio/servers/eu-0${server}/console.log`, size) //D:\\programing\\lua\\factorio\\servers\\s${server}\\data\\console.log
        .then((lines) => {let finalLines = log_message_time(lines.replace(/```/g, ',,,')); msg.channel.send(`\`\`\`${finalLines}\`\`\``, { split: true }) }) // lines gets returned with last X (see above) lines and sent to same channel as command
        .then(console.log(`The last ${size} lines of the log for server #${server} posted in ${msg.channel.name}. (asked for ${size})`)) // logs the command in the console log
        .catch((err) => { internal_error(err); return });
}

module.exports = {
    name: 'log_po',
    aka: ['prev_ol', 'previous_online'],
    description: 'get previous online record (last 10 lines) (Board+ command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.board,
    usage: ` <server#> <#line>`,
    execute(msg, args, _, internal_error) {
        const server = Math.floor(Number(args[0]));
        let size = args[1];
        let sizeLimit = 50;
        let defaultSize = 20;

        if (!server) {
            msg.channel.send('Please pick a server first. Just the number (1-8)')
                .catch((err) => { internal_error(err); return });
            return;
        }
        if (!size) {
            size = defaultSize;
            msg.channel.send(`Using standard amount of lines (${defaultSize}):`)
                .catch((err) => { internal_error(err); return });
        } else if (size > sizeLimit) {
            size = defaultSize;
            msg.channel.send(`Cannot get more than 50 lines, will get ${defaultSize} instead`)
                .catch((err) => { internal_error(err); return });
        } else if (size <= 0) {
            size = defaultSize;
            msg.channel.send(`Cannot be negative or 0, using standard amount of lines (${defaultSize}):`)
                .catch((err) => { internal_error(err); return });
        }
        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            get_logs(server, size, msg)
                .catch((err) => { internal_error(err); return })
        } else {
            msg.reply(`Please pick a server first. Just the number (currently 1-8). Correct usage is \` .exp log_po <server#> <#lines>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`log look up by ${msg.author.username} incorrect server number`);
            return;
        }

    },
};
