const Discord = require('discord.js');

async function runCommand(server, rcon, msg, toUnBan, reason) {
    if(!rcon.connected){
        await msg.channel.send(`S${server} is not connected the bot.`)
        return;
    }

    await rcon.send(`/unban ${toUnBan} ${reason}`);
    await msg.channel.send(`User **${toUnBan}** has been Unbaned for *${reason}*, check with them to see if they can get back on to be sure `);
    const Embed = Discord.MessageEmbed()
    Embed.addField('Unban', `A player has been UnBanned`, false);
    Embed.addField(`Server Details`, `server: S${server}`, false);
    Embed.addField(`Player`, `${toUnBan}`, true);
    Embed.addField(`By`, `${msg.member.displayName}`, true);
    Embed.addField(`Reason`, `${reason}`, true);
    Embed.setColor("00ff00");
    let reportChan = msg.guild.channels.cache.get('368812365594230788'); // Reports channel is "368812365594230788" for exp // Reports Channel is "764881627893334047" for test server
    await reportChan.send(Embed);
}


module.exports = {
    name: 'unban',
    aka: ['unbannd','unbanned','nopermaban','dont-gtfo'],
    description: 'Ban any user (Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'role.staff', //helplevel must be in quotes to work
    required_role: role.staff,
    usage: ` <username> <reason>`,
    async execute(msg, args, rcons, internal_error) {
        const author = msg.member.displayName; //find author

        let server = args[0].replace(/server|s/i, '');
        server = Number(server) || server;

        if(!isNaN(server)){
            server = Math.floor(args[0]);
        }


        let reason = args.slice(2).join(" ");
        let toUnBan = args[1];

        if (!server) { // Checks to see if the person specified a server number
            msg.channel.send('Please pick a server first just a number (1-8). \`<#> <username> <reason>\`');
            console.log(`Ban-Did not have server number`);
            return;
        }

        if (!toUnBan) { // if no 2nd argument returns without running with error
            msg.channel.send(`You need to tell us who you would like to Ban for us to be able to Ban them. \`<#> <username> <reason>\``);
            console.log(`Ban-Did not have name`);
            return;
        }

        if (!reason) { // if no other arguments (after 2nd ) than returns without running with notice to provide a reason
            reason = `*reason not provided*`;
        }

        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            runCommand(server, rcons[server], msg, toUnBan, reason)
                .catch((err) => {internal_error(err); return})
        } else {
            // If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
            msg.reply(`Please pick a server first just a number (1-8) or *all*.  Correct usage is \`.exp ban <server#>\``)
                .catch((err) => {internal_error(err); return})
            console.log(`players online by ${author} incorrect server number`);
        }
    },
};
