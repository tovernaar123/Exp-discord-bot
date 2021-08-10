const Discord = require('discord.js');

async function runCommand(server, rcon, msg, toBan, reason) {
    if(!rcon.connected){
        await msg.channel.send(`S${server} is not connected the bot.`)
        return;
    }

    await rcon.send(`/ban ${toBan} ${reason}`);
    await msg.channel.send(`User **${toBan}** has been Banned for *${reason}*, check with someone on S${server} to be sure `);
    const Embed = Discord.MessageEmbed();
    Embed.addField('Ban', `A player has been Banned`, false);
    Embed.addField(`Server Details`, `server: eu-${server}`, false);
    Embed.addField(`Player`, `${toBan}`, true);
    Embed.addField(`By`, `${msg.author.displayName}`, true);
    Embed.addField(`Reason`, `${reason}`, true);
    Embed.setColor("0xb40e0e");
    // Reports channel is "368812365594230788" for exp 
    // Reports Channel is "764881627893334047" for test server
    let report_channel = msg.guild.channels.cache.get('368812365594230788');
    await report_channel.send({embeds: [Embed]});
}


module.exports = {
    name: 'ban',
    aka: ['bannd','banned','permaban','gtfo'],
    description: 'Ban any user (Admin/Mod only command)',
    guildOnly: true,
    args: true,
    // help level must be in quotes to work
    helpLevel: 'role.staff',
    required_role: role.staff,
    usage: ` <#server> <username> <reason>`,
    async execute(msg, args, rcons, internal_error) {
        const author = msg.author.displayName;
        let server = args[0] || '';

        if (isNaN(server)) {
            // Server is word
            server =  Number(server.replace('/server/i', '').replace('/s/i', '')) || server;
        } 
        
        if (server < 1 || server > 8 || isNaN(server) || server == '') {
            channel.send({content: `Error: Lookup out of range.`}).catch((err) => {internal_error(err); return});
            console.log(`Error: Command - Ban did not have a proper range included.`);
            server = -1;
            return;
        }

        let toBan = args[1];
        let reason = args.slice(2).join(" ");
        
        if (!toBan) { 
            msg.channel.send({content: `Username is required to ban. Correct usage: \`.exp ban<#> <username> <reason>\``});
            console.log(`Error: Command - Ban did not have username supplied.`);
            return;
        }

        if (!reason) {
            msg.channel.send({content: `Reason is required to ban. Correct usage: \`.exp ban<#> <username> <reason>\``});
            console.log(`Error: Command - Ban did not have reason supplied.`);
            return;
        }

        if (server < 9 && server > 0) {
            console.log(`Info: Command - Ban server is ${server}.`);
            runCommand(server, rcons[server], msg, toBan, reason)
                .catch((err) => { internal_error(err); return })
        } else {
            // If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
            msg.reply(`Please pick a server first just a number (1-8) or *all*.  Correct usage is \`.exp ban <server#>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`players online by ${author} incorrect server number`);
        }
    },
};
