const Discord = require('discord.js');
/**
 * 
 * @param {Number} server 
 * @param {Rcon} rcon 
 * @param {Discord.Message} msg 
 * @param {string} reason 
 * @param {string} tojail
*/
async function runcommand(server, rcon, msg, to_un_jail) {
    if (!rcon.connected) {
        await msg.channel.send(`S${server} is not connected the bot.`)
        return;
    }
    let res = await rcon.send(`/unjail ${to_un_jail}`)
    if (res === "Command Complete\n") {
        await msg.channel.send(`**${to_un_jail}** has been unjailed on S${server}`);
        console.log(`${msg.author.username} has unjailed ${to_un_jail} on S${server}.`);
    } else {
        await msg.channel.send(`Command might have failed result: \`\`\`${res}\`\`\``);
    }
}

module.exports = {
    name: 'unjail',
    aka: ['unlockup'],
    description: 'jail any user (Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'role.staff', //helplevel must be in quotes to work,
    required_role: role.staff,
    usage: `<#> <username> <reason>`,
    execute(msg, args, rcons, internal_error) {
        const server = Math.floor(Number(args[0]));
        let to_un_jail = args[1];
        if (!server) {
            msg.channel.send('Please pick a server first just a number (1-8)')
                .catch((err) => { internal_error(err); return });
            return;
        }
        if (!to_un_jail) {
            msg.channel.send(`You need to tell us who you would like to unjail for us to be able to unjail them`)
                .catch((err) => { internal_error(err); return })
            return;
        }
        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            runcommand(server, rcons[server], msg, to_un_jail)
                .catch((err) => { internal_error(err); return })
        } else {
            msg.reply(`Please pick a valid server first. Just the number (currently 1-8). Correct usage is \` unjail <server#> <username>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`unjail by ${msg.author.username} used the incorrect server number`);
            return;
        }
    },
};
