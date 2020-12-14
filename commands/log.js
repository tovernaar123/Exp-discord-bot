const readLastLines = require(`read-last-lines`);

async function get_logs(server, size, msg, internal_error) {
    readLastLines.read(`/home/factorio/servers/eu-0${server}/console.log`, size) //D:\\programing\\lua\\factorio\\servers\\s${server}\\data\\console.log
        .then((lines) => {
            lines = lines.replace(/```/g, ',,,');
            lines = lines.split('\n');
            lines = lines.slice(start-1, end+1);
            lines = lines.join('\n');
            lines = lines.match(/[\s\S]{1,1500}/g);

            for (let i = 0; i < lines.length; i++) {
                msg.channel.send(`\`\`\`${lines[i]}\`\`\``)
                    .catch((err) => {internal_error(err); return});
            }
        }) // lines gets returned with last X (see above) lines and sent to same channel as command
        .then(console.log(`The last ${size} lines of the log for server #${server} posted in ${msg.channel.name}. (asked for ${size})`)) // logs the command in the console log
        .catch((err) => {internal_error(err); return});
}

module.exports = {
    name: 'log',
    aka: ['dlchat', 'logs'],
    description: 'get previous chat log (last 10 lines) (Board+ command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.board,
    usage: ` <server#> <amount of lines> <starting from line>`,
    execute(msg, args, _, internal_error) {
        const server = Math.floor(Number(args[0]));
        let size = Math.floor(Number(args[1]));
        let sl = Math.floor(Number(args[2]));

        if (isNaN(size)) {
            msg.reply(`Please give the amount of lines you want`)
                .catch((err) => {internal_error(err); return})
        }

        let sizeLimit = 50;
        let defaultSize = 10;
        let defaultSl = 1;

        if (!server) {
            msg.channel.send('Please pick a server first. Just the number (1-8)')
                .catch((err) => {internal_error(err); return});
            return;
        }
        
        if (!size) {
            size = defaultSize;
            msg.channel.send(`Using standard amount of lines (${defaultSize}):`)
                .catch((err) => {internal_error(err); return});
        } else if (size > sizeLimit) {
            size = defaultSize;
            msg.channel.send(`Cannot get more than ${sizeLimit} lines, will get ${defaultSize} instead`)
                .catch((err) => {internal_error(err); return});
        } else if (size <= 0) {
            size = defaultSize;
            msg.channel.send(`Cannot be negative or 0, using standard amount of lines (${defaultSize}):`)
                .catch((err) => {internal_error(err); return});
        }
        
        if (!sl || isNaN(sl)) {
            sl = defaultSl;
        } else if (sl > size) {
            sl = defaultSl;
            msg.channel.send(`Starting line cannot be larger than ending line, will use default starting line ${defaultSl} instead`)
                .catch((err) => {internal_error(err); return});
        } else if (sl <= 0) {
            sl = defaultSl;
            msg.channel.send(`Cannot be negative or 0, using standard starting line (${defaultSl}):`)
                .catch((err) => {internal_error(err); return});
        }

        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            get_logs(server, size, msg, internal_error)
                .catch((err) => {internal_error(err); return})
        } else {
            msg.reply(`Please pick a server first. Just the number (currently 1-8). Correct usage is \` .exp log <server#> <#lines>\``)
                .catch((err) => {internal_error(err); return})
            console.log(`log look up by ${msg.author.username} incorrect server number`);
            return;
        }
    },
};
