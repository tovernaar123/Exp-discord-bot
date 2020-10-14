
const Discord = require('discord.js');
async function runCommand(server, rcon, msg, toKick, reason) {
    if(!rcon.connected){
        await msg.channel.send(`S${server} is not connected the bot.`)
        return;
    }
    await rcon.send(`/kick ${toKick} ${reason}`);
    await msg.channel.send(`User **${toKick}** has been kicked for *${reason}*, check with someone on S${server} to be sure `);
    const Embed = Discord.MessageEmbed()
    Embed.addField('Kick', `A player has been kicked`, false);
    Embed.addField(`Server Details`, `server: S${server}`, false);
    Embed.addField(`Player`, `${toKick}`, true);
    Embed.addField(`By`, `${msg.author.username}`, true);
    Embed.addField(`Reason`, `${reason}`, true);
    Embed.setColor("0xb40e0e");
    let reportChan = msg.guild.channels.cache.get('764881627893334047'); // Reports channel is "368812365594230788" for exp // Reports Channel is "764881627893334047" for test server
    await reportChan.send(Embed);
}


module.exports = {
    name: 'kick',
    aka: ['boot,kicks,out,bye'],
    description: 'Kick any user (Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'canKick',
    required_role: role.staff,
    usage: ` <username> <reason>`,
    execute(msg, args, rcons, internal_error) {
        const author = msg.author.username; //find author
        const server = Math.floor(Number(args[0]));

        let reason = args.slice(2).join(" ");
        let toKick = args[1];

        if (!server) { // Checks to see if the person specified a server number, then checks to see if the server number is part of the array of the servers it could be (1-8 currently)
            msg.channel.send('Please pick a server first just a number (1-8). \`<#> <username> <reason>\`');
            console.log(`Kick-Did not have server number`);
            return;
        }
        if (!toKick) { // if no 2nd argument returns without running with error
            msg.channel.send(`You need to tell us who you would like to kick for us to be able to kick them. \`<#> <username> <reason>\``);
            console.log(`Kick-Did not have name`);
            return;
        }
        if (!reason) { // if no other arguments (after 2nd ) than returns without running with notice to provide a reason
            msg.channel.send(`Please put a reason, you can always rekick or reban later with a better one.\`<#> <username> <reason>\``);
            console.log(`Kick-Did not have reason`);
            return;
        }
        if (server < 9 && server > 0) {
            console.log('Server is 1-8');
            runCommand(server, rcons[server], msg, toKick, reason)
                .catch((err) => { internal_error(err); return })
        } else {
            // If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
            msg.reply(`Please pick a server first just a number (1-8) or *all*.  Correct usage is \`.exp kick <server#>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`players online by ${author} incorrect server number`);
        }
    },
};
