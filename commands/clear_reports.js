const Discord = require('discord.js');

async function runCommand(server, rcon, msg, username, author, reason) {
    if(!rcon.connected){
        await msg.channel.send(`S${server} is not connected the bot.`)
        return;
    }

    let res = await rcon.send(`/interface require("modules.control.reports").remove_all("${username}", "${author}")`)
    await msg.channel.send({content: `User ${username} has a report removed by: ${author} becasue of ${reason}`});
    console.log(`Info: Command - Clear Reports has removed a report of ${username} by ${author} because of ${reason}.`);
}

module.exports = {
    name: 'clear-reports',
    aka: ['clearreports','cr','clear_reports','clear-report'],
    description: 'Clear reports on user (Mod+)',
    guildOnly: true,
    args: true,
    helpLevel: 'role.staff',
    required_role: role.staff,
    usage: `<server#> <username> <reason>`,
    async execute(msg, args, rcons, internal_error) {
        const author = msg.author.displayName;
        let server = args[0] || 0;

        let username = args[1] || '';
        let reason = args.slice(2).join(" ") || '';
        
        if (isNaN(server)) {
            // Server is word
            server =  Number(server.replace('/server/i', '').replace('/s/i', '')) || server;
        } 

        if (server < 1 || server > 8 || isNaN(server)) {
            channel.send({content: `Error: Server lookup out of range.`}).catch((err) => {internal_error(err); return});
            console.log(`Error: Command - Clear RepCorts did not have a proper server range included.`);
            server = 0;
            return;
        }

        if (!username) { 
            msg.channel.send({content: `Username is required to ban. Correct usage: \`.exp ban<#> <username> <reason>\``});
            console.log(`Info: Command - Clear Reports did not have username supplied.`);
            return;
        }

        if (!reason) {
            msg.channel.send({content: `Reason is required to ban. Correct usage: \`.exp ban<#> <username> <reason>\``});
            console.log(`Info: Command - Clear Reports did not have reason supplied.`);
            return;
        }

        if (server < 9 && server > 0) {
            console.log(`Info: Command - Clear Reports server is ${server}.`);
            runCommand(server, rcons[server], msg, username, author, reason).catch((err) => {internal_error(err); return});
        }
    },
};
