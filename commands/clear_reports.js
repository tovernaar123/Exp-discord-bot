const Discord = require('discord.js');

async function runCommand(server, rcon, msg, username, reason) {
    if(!rcon.connected){
        await msg.channel.send(`S${server} is not connected the bot.`)
        return;
    }

    let res = await rcon.send(`/interface require("modules.control.reports").remove_all("${username}", "${msg.member.displayName}")`)
    await msg.channel.send(`*Please make sure you have the correct username and a report was issued in #reports.* Server replies complete even if user does not exist. Server replied: ${res} By: ${msg.member.displayName} becasue: *${reason}*`);
    console.log(`A user tried to Clear ${username}'s reports... \n    Server replied: ${res}    By: ${msg.member.displayName}/${msg.member.id} \n    Becasue: *${reason}*`);
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

        let toClear = args[1];
        let reason = args.slice(2).join(" ");
        
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

        if (!toClear) { // if no 2nd argument returns without running with error
            msg.channel.send(`You need to tell us who you would like to clear for us to be able to clear-all \`<#> <username> <reason>\``)
            .catch((err) => {internal_error(err); return});
            console.log(`lear RepCorts - Did not have name`);
            return;
        }
        if (!reason) { // if no other arguments (after 2nd ) than returns without running with notice to provide a reason
            msg.channel.send(`Please put a reason for the report chan. \`<#> <username> <reason>\``)
            .catch((err) => { internal_error(err); return });
            console.log(`Clear Reports -Did not have reason`);
            return;
        }
        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            runCommand(server, rcons[server], msg, toClear, reason)
                .catch((err) => { internal_error(err); return })
        } else {
            // If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
            msg.reply(`Please pick a server first (**just the number 1-8**). Correct usage is \`.exp clear-all <server#> <reason>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`players online by ${author} incorrect server number`);
        }
    },
};
