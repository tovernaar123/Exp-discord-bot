const Discord = require('discord.js');
module.exports = {
    name: 'afk',
    aka: ['whoisafk', 'afkstreak', 'alwaysafk'],
    description: 'how many players are online?',
    guildOnly: true,
    args: true,
    required_role: role.staff,
    usage: `<#>`,
    async execute(msg, args, rcons, internal_error) {
        const server = Math.floor(Number(args[0]));
        let extra = args.slice(1).join(" "); // cant have any of this here for afk
        let rconToSend = `/sc local afk_times, ctn = {}, 0 for _, p in ipairs(game.connected_players) do  afk_times[p.name] = p.afk_time end  rcon.print(game.table_to_json(afk_times))`; //send afk chat bot

        if (extra) { // if no other arguments (after 2nd ) than returns without running with notice to provide a reason
            msg.channel.send(`Please remove "${extra}". Correct usage: \`.exp afk <Server#>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`AFK was given too many arguments`);
            return;
        }
        if (!server) { // Checks to see if the person specified a server number.
            msg.channel.send('Please pick a server first just a number (1-8). \`<#> <username> <reason>\`')
                .catch((err) => { internal_error(err); return })
            console.log(`Kick-Did not have server number`);
            return;
        }

        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            runCommand(server, rcons[server], msg, internal_error)
                .catch((err) => { internal_error(err); return })
        } else {
            // If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
            msg.reply(`Please pick a server first just a number (1-8).  Correct usage is \`.exp afk <server#>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`players online by ${msg.author.username} incorrect server number`);
        }
        async function runCommand(server, rcon, msg, internal_error) {
            let json_data
            try {
                if(!rcon.connected){
                    const Embed = Discord.MessageEmbed()
                    Embed.addField(`S${server} is not connected to the bot`, `S${server} offline`, false)
                    await msg.channel.send(Embed);
                    return
                }
                const responses = await rcon.send(rconToSend);
                if(responses){
                    json_data = JSON.parse(responses)
                }else{
                    const Embed = Discord.MessageEmbed()
                    Embed.addField(`AFK players S${server}`, `request by ${msg.author.username}`, false)
                    Embed.addField(`No players online`, `\u200B`, false);
                    await msg.channel.send(Embed)
                }
            } catch (err) {
                return internal_error(err)
            }
            // If Responses is blank (not normal).
            if (!json_data) {
                await msg.channel.send(`There was no response from the server, this is not normal for this command please ask an admin to check the logs.`)
                console.log(`Rcon: There was no response from the server, this is not normal for this command please ask an admin to check the logs.`);
                return;
            };
            // If repsonse by rcon/factorio exists than runs function "resp" in this case prints the rcon response instead of sucess/fail message *in kicks and bans only if player does nto exist or wrong santax
            if (json_data) {
                const Embed = Discord.MessageEmbed()
                let length = Object.keys(json_data).length
                if(length === 0 ){
                    Embed.addField(`AFK players S${server}`, `request by ${msg.author.username}`, false)
                    Embed.addField(`No players online`, `\u200B`, false);
                }else{
                    Embed.addField(`AFK players S${server}`, `request by ${msg.author.username} \n \u200B`, false)
                }
                for (let name in json_data) {
                    let time = json_data[name] / 60;
                    let hours = Math.floor(time / 3600);
                    let minutes = Math.floor(time / 60) - (hours * 60);
                    let seconds = Math.floor(time - ((hours * 3600) + (minutes * 60)));
                    if(hours > 0 ){
                        Embed.addField(`${name}:`, `${hours}h, ${minutes}m and ${seconds}s`, false);
                    }else{
                        Embed.addField(`${name}:`, `${minutes}m and ${seconds}s`, false);
                    }
                }
                await msg.channel.send(Embed)
            }

        }
    },
};
