const Discord = require('discord.js');
/**
 * 
 * @param {Number} server 
 * @param {Rcon} rcon 
 * @param {Discord.Message} msg 
*/
async function runcommand(server, rcon, msg, newSpeed) {
    if (!rcon.connected) {
        await msg.channel.send(`S${server} is not connected the bot.`)
        return;
    }
    //let res = await rcon.send(`/jail ${tojail} ${reason}`)
    let res = await rcon.send(`/interface game.forces.player.cancel_current_research()`)
    if (!res) {
        rcon.send(`The existing server research has been cancelled by ${msg.member.displayName}. Please @staff on the discord if this was done by mistake.`);
        await msg.channel.send(`No Error - Existing research should have been cancelled on S${server}. Action requested by *${msg.member.displayName}*.`);
        console.log(`${msg.author.displayName} has cancel existing research on the server*`);
    } else {
        await msg.channel.send(`Command might have failed result: \`\`\` ${res} \`\`\``);
    } 
}
 
module.exports = {
    name: 'speed',
    aka: ['gamespeed','speeds','slowdown','slow','newspeed'],
    description: 'Slow down (or speed up) server (Currently Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.staff,
    usage: `<#> <NewGameSpeed> (.10-1.0)`,
    async execute(msg, args, rcons, internal_error) {
        const server = Math.floor(Number(args[0]));
        //let reason = args.slice(2).join(" ");
        let newSpeed = args[1];
        if (!server) {
            msg.channel.send('Please pick a server first just a number (1-8)')
                .catch((err) => { internal_error(err); return });
            return;
        }
        if (!newSpeed) {
            msg.channel.send(`No speed requested - You need to tell us what speed to use`)
                .catch((err) => { internal_error(err); return })
            return;
        }
        if (newSpeed > 1 || newSpeed < 0.1) {
            //console.log(`Speed to set (newSpeed) is ${newSpeed}`);
            msg.channel.send(`You need to tell us what speed to use (0.10-1.0)`)
                .catch((err) => { internal_error(err); return })
            return;
        }
        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            console.log(`server spped to set is ${newSpeed}`)
            runcommand(server, rcons[server], msg, newSpeed)
                .catch((err) => { internal_error(err); return })
        } else {
            msg.reply(`Please pick a server first just a number (Currently 1-8). Correct usage is \` .exp jail <server#> <username> <reason>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`jail by ${msg.author.username} incorrect server number`);
            return;
        }
    },
};
