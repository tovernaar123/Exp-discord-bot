/*
var msg = ``;
var type = 'chat';

msg = msg.split('\n');
var msg_n = [];

for (let i = 0; i < msg.length; i++) {
    if (type == '') {
        msg_n.push(msg[i])
    }
    else if (type == 'chat') {
        if ((msg[i].indexOf('[CHAT]') != -1)) {
            msg_n.push(msg[i])
        }
    }
    else if (type == 'event') {
        if ((msg[i].indexOf('[CHAT]') == -1)) {
            msg_n.push(msg[i])
        }
    }
}

console.log(msg_n);

*/

const readLastLines = require(`read-last-lines`);
async function get_logs(server, size, msg) {
    readLastLines.read(`/home/factorio/servers/eu-0${server}/console.log`, size) //D:\\programing\\lua\\factorio\\servers\\s${server}\\data\\console.log
        .then((lines) => { let finalLines = lines.replace(/```/g, ',,,'); msg.channel.send(`\`\`\`${finalLines}\`\`\``, { split: true }) }) // lines gets returned with last X (see above) lines and sent to same channel as command
        .then(console.log(`The last ${size} lines of the log for server #${server} posted in ${msg.channel.name}. (asked for ${size})`)) // logs the command in the console log
        .catch((err) => { internal_error(err); return });
}

module.exports = {
    name: 'log',
    aka: ['dlchat', 'logs'],
    description: 'get previous chat log (last 10 lines) (Board+ command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.board,
    usage: ` <server#> <lines> <type>`,
    // usage: ` <server#> <ending lines> <starting lines> <type>`,
    execute(msg, args, _, internal_error) {
        const server = Math.floor(Number(args[0]));
        let size = args[1];
        let sizeLimit = 50;
        let defaultSize = 10;

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
            msg.reply(`Please pick a server first. Just the number (currently 1-8). Correct usage is \` .exp unjail <server#> <username>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`log look up by ${msg.author.username} incorrect server number`);
            return;
        }

    },
};
