function parse_log(log) {
    let data = log.split('\n');
    if(data.length === 1){ data = data[0].split('\r');}
    let final_message = '';
    for (let i = 0; i < data.length; i++) {
        let line = data[i]
        if (!(line.includes('[CHAT]') || line.includes('[JOIN]') || line.includes('[LEAVE]'))) {
            final_message += `${line}\n`
        }
    }
    if(final_message === ''){
        return 'No events'
    }
    return final_message;
}

const readline = require('readline');
const fs = require('fs');
function getLines(server) {
    return new Promise((resolve, reject) => {
        let lines = []

        const rl = readline.createInterface({
            input: fs.createReadStream(`/home/factorio/servers/eu-0${server}/console.log`),
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
    lines = lines.join('\n')
    lines = lines.replace(/\[special-item=.*?\]/g, '<blueprint>');
    lines = parse_log(lines.replace(/```/g, ',,,'));
    lines = lines.split('\n');
    lines = lines.slice(-1 * size);

    //Split on enters and limit size per line
    let final_lines = []
    let current_msg = "";
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i]
        if (line.length > 500) { //max limit of 500 chars per line
            line = line.replace(/(.*?\[.*?\] .*?:).*/, '$1 <message to long>');
        }

        if (current_msg.length + line.length > 1900) {
            final_lines.push(current_msg);
            current_msg = line + '\n';
        } else {
            current_msg += line + '\n';
        }
    }
    //push the final current_msg
    final_lines.push(current_msg);

    //send the log in the code blocks
    for (let i = 0; i < final_lines.length; i++) {
        await msg.channel.send(`\`\`\`log\n${final_lines[i]}\`\`\``);
    }
}

module.exports = {
    name: 'eventlog',
    aka: ['events', 'log-events'],
    description: 'get previous chatlog (last 10 lines) (Board+ command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.board,
    usage: ` <server#> <amount of lines>`,
    async execute(msg, args, _, internal_error) {
        const server = Math.floor(Number(args[0]));
        let size = Math.floor(Number(args[1]));
        if (isNaN(size)) {
            msg.reply(`Please give the amount of lines you want`)
                .catch((err) => { internal_error(err); return })
        }

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
            msg.channel.send(`Cannot get more than ${sizeLimit} lines, will get ${defaultSize} instead`)
                .catch((err) => { internal_error(err); return });
        } else if (size <= 0) {
            size = defaultSize;
            msg.channel.send(`Cannot be negative or 0, using standard amount of lines (${defaultSize}):`)
                .catch((err) => { internal_error(err); return });
        }

        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            get_logs(server, size, msg, internal_error)
                .catch((err) => { internal_error(err); return })
        } else {
            msg.reply(`Please pick a server first. Just the number (currently 1-8). Correct usage is \` .exp events ${module.exports.usage}\``)
                .catch((err) => { internal_error(err); return })
            console.log(`chatlog look up by ${msg.author.username} incorrect server number`);
            return;
        }
    },
};
