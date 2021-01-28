const readline = require('readline');
const fs = require('fs');
function getLines(server) {
    return new Promise((resolve, reject) => {
        let lines = []

        const rl = readline.createInterface({
            input:fs.createReadStream(`/home/factorio/servers/eu-0${server}/console.log`),
        })

        rl.on('line', line => {
            lines.push(line)
            if (line.startsWith('=')) {
                lines = []
            }
        })

        rl.on('close', () => {
            resolve(lines)
        })

    })
}

async function get_logs(server, size, msg) {
    let lines = await getLines(server);
    lines = lines.reverse();
    lines = lines.slice(0, size);
    lines = lines.join('\n');
    lines = lines.replace(/```/g, ',,,');
    lines = lines.match(/[\s\S]{1,1500}/g);
    for (let i = 0; i < lines.length; i++) {
        await msg.channel.send(`\`\`\`log\n${lines[i]} \n\`\`\``);
    }
}
module.exports = {
    name: 'log',
    aka: ['dlchat', 'logs'],
    description: 'get chat (last 10 lines) (Board+ command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.board,
    usage: ` <server#> <amount of lines> <starting from line>`,
    async execute(msg, args, _, internal_error) {
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
            msg.reply(`Please pick a server first. Just the number (currently 1-8). Correct usage is \` .exp log <server#> <#oflines> <optionalStartingLine#>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`log look up by ${msg.author.username} incorrect server number`);
            return;
        }

    },
};
