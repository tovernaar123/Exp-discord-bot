const Discord = require('discord.js');

/**
 * 
 * @param {Number} server 
 * @param {Rcon} rcon 
 * @param {Discord.Message} msg 
 * @param {string} reason 
 * @param {string} tojail
*/
async function runcommand(server, rcon, msg, reason, tojail) {
    if (!rcon.connected) {
        await msg.channel.send(`S${server} is not connected the bot.`)
        return;
    }
    //let res = await rcon.send(`/jail ${tojail} ${reason}`)
    let res = await rcon.send(`/interface require("modules.control.jail").jail_player("${tojail}", "${msg.member.displayName}", "${reason}")`)
    if (res === "Command Complete\n") {
        await msg.channel.send(`**${tojail}** has been jailed on S${server} for *${reason}*.`);
        console.log(`${msg.author.username} has jailed ${tojail} on S${server} for *${reason}*`);
    } else {
        await msg.channel.send(`Command might have failed result: \`\`\`${res}\`\`\``);
    }
}

module.exports = {
    name: 'jail',
    aka: ['jails'],
    description: 'jail any user (Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.staff,
    usage: `<#> <username> <reason>`,
    execute(msg, args, rcons, internal_error) {
        let server = args[0].replace(/server|s/i, '');
        server = Number(server) || server;

        if(!isNaN(server)){
            server = Math.floor(args[0]);
        }

        let rea = args.slice(2).join(" ");
        let reason = `${rea} Via Discord by ${msg.author.username}`;
        let tojail = args[1];

        if (!server) {
            msg.channel.send('Please pick a server first just a number (1-8)')
                .catch((err) => {internal_error(err); return});
            return;
        }

        if (!reason) {
            msg.channel.send(`Please provide a reason. Correct usage is \` .exp jail <server#> <username> <reason>\``)
                .catch((err) => {internal_error(err); return})
            return;
        }

        if (!tojail) {
            msg.channel.send(`You need to tell us who you would like to jail for us to be able to jail them`)
                .catch((err) => {internal_error(err); return})
            return;
        }

        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            runcommand(server, rcons[server], msg, reason, tojail)
                .catch((err) => { internal_error(err); return})
        } else {
            msg.reply(`Please pick a server first just a number (Currently 1-8). Correct usage is \` .exp jail <server#> <username> <reason>\``)
                .catch((err) => {internal_error(err); return})
            console.log(`jail by ${msg.author.username} incorrect server number`);
            return;
        }
    },
};
