const readLastLines = require(`read-last-lines`);
async function get_logs(server, size, msg) {
    readLastLines.read(`/home/factorio/servers/eu-0${server}/console.log`, size) //home/factorio/servers/eu-0${server}/console.log
        .then((lines) => msg.channel.send(lines, { split: true })) // lines gets returned with last X (see above) lines and sent to same channel as command
        .then(console.log(`The last ${size} lines of the log for server #${server} posted in ${msg.channel.name}. (asked for ${size})`)) // logs the command in the console log
        .catch((err) => { internal_error(err); return });
}

module.exports = {
    name: 'log',
    aka: ['dlchat', 'logs'],
    description: 'get chat (last 10 lines) (Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.staff,
    usage: ` <server#> <lines>`,
    execute(msg, args, _, internal_error) {
        const server = Math.floor(Number(args[0]));
        let size = args[1];
        let sizeLimit = 50;
        let defaultSize = 10;

        if (!server) {
            msg.channel.send('Please pick a server first just a number (1-8)')
                .catch((err) => { internal_error(err); return });
            return;
        }
        if (!size) {
            size = defaultSize;
            msg.channel.send(`Using standart amount of lines (${defaultSize}):`)
                .catch((err) => { internal_error(err); return });
        }else if(size > sizeLimit){
            size = defaultSize;
            msg.channel.send(`Cant not get more then 50 lines, will get ${defaultSize} instead`)
                .catch((err) => { internal_error(err); return });
        }else if(size <= 0){
            size = defaultSize;
            msg.channel.send(`Cant be negative or 0, using standart amount of lines (${defaultSize}):`)
                .catch((err) => { internal_error(err); return });
        }
        if (server < 9 && server > 0) {
            console.log('Server is 1-8');
            get_logs(server, size, msg)
                .catch((err) => { internal_error(err); return })
        } else {
            msg.reply(`Server number can\'t be bigger then 8 or smaller then 1. Correct usage is \` .exp unjail <server#> <username>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`jail by ${msg.author.username} incorrect server number`);
            return;
        }

    },
};