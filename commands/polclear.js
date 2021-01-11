
const Discord = require('discord.js');
/**
 * 
 * @param {Number} server 
 * @param {Rcon} rcon 
 * @param {Discord.Message} msg 
*/
async function runcommand(server, rcon, msg, extra) {
    if (!rcon.connected) {
        await msg.channel.send(`S${server} is not connected the bot.`)
        return;
    }
    let res = await rcon.send(`/c game.surfaces[1].clear_pollution()`) // Send command to clear pollution
    if (!res) { // this command should not get a reply from the server. The command should print on the ingame server though.
        rcon.send(`The server had pollution **REMOVED** by ${msg.member.displayName}. Please @staff on the discord if this was done by mistake.`);
        await msg.channel.send(`No Error - Thus pollution should have been **removed** on S${server}. Command Requested by *${msg.member.displayName}*.`);
        console.log(`${msg.author.displayName} has turned OFF polution*`);
    } else {
        await msg.channel.send(`Command might have failed result: \`\`\` ${res} \`\`\``);
    } 
}
 
module.exports = {
    name: 'polclear',
    aka: ['clearpollution','clearpollution','clear-pollution',`clearpol`,'remove-pollution'],
    description: 'Clears Pollution (Currently Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.staff,
    usage: `\`<#>\` (Server Number, number only)`,
    execute(msg, args, rcons, internal_error) {
        let prefix = process.env.PREFIX;
        const server = Math.floor(Number(args[0]));
        //let reason = args.slice(2).join(" ");
        let extra = args[1];
        if (!server) {
            msg.channel.send('Please pick a server first just a number (1-8)')
                .catch((err) => { internal_error(err); return });
            return;
        }
        if (extra) {
            msg.channel.send(`No additional arguments needed. Correct usage: \`${prefix} <#>\` (Server Number only)\n **Command Not Run** `)
                .catch((err) => { internal_error(err); return })
            return;
        }
        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            console.log(`Server Pollution cleared`)
            runcommand(server, rcons[server], msg)
                .catch((err) => { internal_error(err); return })
        } else {
            msg.reply(`Please pick a server first just a number (Currently 1-8). Correct usage is \`${prefix} poloff <server#>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`pollution clear (polclear) ${msg.author.username} incorrect server number`);
            return;
        }
    },
};
