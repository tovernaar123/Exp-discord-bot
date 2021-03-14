const Discord = require('discord.js');

/**
 * 
 * @param {Number} server 
 * @param {Rcon} rcon 
 * @param {Discord.Message} msg 
*/
let prefix = process.env.PREFIX;
async function runcommand(server, rcon, msg) {
    if (!rcon.connected) {
        await msg.channel.send(`S${server} is not connected the bot.`)
        return;
    }

    // Send command to pause the server
    let res = await rcon.send(`/sc game.tick_paused = true`) 

    // this command should not get a reply from the server. The command should print on the ingame server though.
    if (!res) { 
        rcon.send(`The server IS PAUSED by a remote admin (${msg.member.displayName}). Please @staff on the discord if this was done by mistake. ->>> http://discord.explosivegaming.nl`);
        await msg.channel.send(`No Error - Thus the game should have been **paused** on S${server}. Command Requested by *${msg.member.displayName}*.\n to unpause run \`${prefix} unpause <#>\``);
        console.log(`${msg.member.displayName} has paused S${server}`);
    } else {
        await msg.channel.send(`Command might have failed result: \`\`\` ${res} \`\`\``);
    } 
}
 
module.exports = {
    name: 'pause',
    aka: ['paused','stop'],
    description: 'Pauses the game (Currently Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.staff,
    usage: `\`<#>\` (Server Number, number only)`,
    execute(msg, args, rcons, internal_error) {
        const server = Math.floor(Number(args[0]));
        //let reason = args.slice(2).join(" ");
        let extra = args[1];

        if (!server) {
            msg.channel.send('Please pick a server first just a number (1-8)')
                .catch((err) => {internal_error(err); return});
            return;
        }

        if (extra) {
            msg.channel.send(`No additional arguments needed. Correct usage: \`${prefix} pause <#>\` (Server Number only)\n **Command Not Run** `)
                .catch((err) => {internal_error(err); return})
            return;
        }

        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            console.log(`Server ${server} PAUSED by ${msg.member.displayName}`)
            runcommand(server, rcons[server], msg)
                .catch((err) => {internal_error(err); return})
        } else {
            msg.reply(`Please pick a server first just a number (Currently 1-8). Correct usage is \`${prefix} pause <server#>\``)
                .catch((err) => {internal_error(err); return})
            console.log(`Server Pause ${msg.member.username} incorrect server number`);
            return;
        }
    },
};

