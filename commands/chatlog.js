const fs = require('fs');
const util = require('util');

//Make readifle a promise. 
const readFile = util.promisify(fs.readFile);

function parse_log(log) {
    /*
        Regex explanation:
        .*? means get any charter until what comes next (\[CHAT\]).
        Just a not the ? in .*? makes the * operator non greedy which is to make sure it does not just grab everything.
        Then we have \[CHAT\] the only thing here is that ] and [ are regex chartes
        so we have to esacpe with \
        Then we have .*?\n which agains get any charter until \n and then it stops as it shood.
    */
    let chat = log.match(/.*?\[CHAT\].*?\n/g);
    return chat.join('');
}

async function get_logs(server, size, msg) {
    let lines = await readFile(`/home/factorio/servers/eu-0${server}/console.log`);
    lines = lines.toString();
    lines = parse_log(lines.replace(/```/g, ',,,'));
    lines = lines.split('\n');
    lines = lines.reverse();
    lines.length = size;
    lines = lines.reverse();
    lines = lines.join('\n');
    lines = lines.match(/[\s\S]{1,1500}/g); 
    for (let i = 0; i < lines.length; i++) {
        await msg.channel.send(`\`\`\`${lines[i]}\`\`\``)
    }
}

module.exports = {
    name: 'chatlog',
    aka: ['chat', 'chats', 'log-chat'],
    description: 'get previous chatlog (last 10 lines) (Board+ command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.board,
    usage: ` <server#> <amount of lines>`,
    execute(msg, args, _, internal_error) {
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
            msg.reply(`Please pick a server first. Just the number (currently 1-8). Correct usage is \` .exp chatlog ${module.exports.usage}\``)
                .catch((err) => { internal_error(err); return })
            console.log(`chatlog look up by ${msg.author.username} incorrect server number`);
            return;
        }
    },
};
