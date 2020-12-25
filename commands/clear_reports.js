
const Discord = require('discord.js');
async function runCommand(server, rcon, msg, toClear, reason) {
    if(!rcon.connected){
        await msg.channel.send(`S${server} is not connected the bot.`)
        return;
    }
    let res = await rcon.send(`/interface require("modules.control.reports").remove_all("${toClear}", "${msg.member.displayName}")`)
    await msg.channel.send(`*Please make sure you have the correct username and a report was issued in #reports. Server replies sucess even if user does not exist. Server replied: ${res} \n By: ${msg.member.displayName} becasue: *${reason}*`);
    console.log(`A users tried to Clear ${toClear}'s reports... \n    Server replied: ${res} \n    By: ${msg.member.displayName}/${msg.member.id} \n    Becasue: *${reason}*`);
    // const Embed = Discord.MessageEmbed()
    //Embed.addField('Clear', `A player has been `, false);
    //Embed.addField(`Server Details`, `server: S${server}`, false);
    //Embed.addField(`Player`, `${toClear}`, true);
    //Embed.addField(`By`, `${msg.author.username}`, true);
    //Embed.addField(`Reason`, `${reason}`, true);
    //Embed.setColor("0xffa500");
    let reportChan = msg.guild.channels.cache.get('368812365594230788'); // Reports channel is "368812365594230788" for exp // Reports Channel is "764881627893334047" for test server
    //await reportChan.send(Embed);
}


module.exports = {
    name: 'clear-reports',
    aka: ['clearreports','cr','clear_reports','clear-report'],
    description: 'Clear reports on ingame users (Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'role.staff',
    required_role: role.staff,
    usage: ` <username> <reason>`,
    async execute(msg, args, rcons, internal_error) {
        const author = msg.author.username; //find author
        const server = Math.floor(Number(args[0]));

        let reason = args.slice(2).join(" ");
        let toClear = args[1];

        if (!server) { // Checks to see if the person specified a server number
            msg.channel.send('Please pick a server first (**just the number 1-8**). \`<Server#> <username> <reason>\`');
            console.log(`Clear Reports- Did not have server number`);
            return;
        }
        if (!toClear) { // if no 2nd argument returns without running with error
            msg.channel.send(`You need to tell us who you would like to clear for us to be able to clear-all \`<#> <username> <reason>\``);
            console.log(`Clear Reports - Did not have name`);
            return;
        }
        if (!reason) { // if no other arguments (after 2nd ) than returns without running with notice to provide a reason
            msg.channel.send(`Please put a reason for the report chan. \`<#> <username> <reason>\``);
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
