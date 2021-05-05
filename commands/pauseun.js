
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
    let res = await rcon.send(`/sc game.tick_paused = false`) // Send command to unpause the game
    if (!res) { // this command should not get a reply from the server. The command should print on the ingame server though.
        rcon.send(`The server was unpaused remotly by ${msg.member.displayName}. Please @staff on the discord if this was done by mistake.`);
        await msg.channel.send(`No Error - Thus the game should have been **UN**paused on S${server}. Command Requested by *${msg.member.displayName}*.`);
        console.log(`${msg.member.displayName} has UNpaused S${server}`);
    } else {
        await msg.channel.send(`Command might have failed result: \`\`\` ${res} \`\`\``);
    } 
}
 
module.exports = {
    name: 'unpause',
    aka: ['pausedun','unstop','resume','pauseun'],
    description: 'Unpauses the game (Currently Admin/Mod only command)',
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
                .catch((err) => { internal_error(err); return });
            return;
        }
        if (extra) {
            msg.channel.send(`No additional arguments needed. Correct usage: \`${prefix} pause <#>\` (Server Number only)\n **Command Not Run** `)
                .catch((err) => { internal_error(err); return })
            return;
        }
        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            console.log(`Server UNpaused`)
            runcommand(server, rcons[server], msg)
                .catch((err) => { internal_error(err); return })
        } else {
            msg.reply(`Please pick a server first just a number (Currently 1-8). Correct usage is \`${prefix} unpause <server#>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`Server UNpaused ${msg.member.username} incorrect server number`);
            return;
        }
    },
};

