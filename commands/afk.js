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
        let author = msg.author.displayName;
        let server = args[0] || 4;

        if (isNaN(server)) {
            // Server is word
            server =  Number(server.replace('/server/i', '').replace('/s/i', '')) || server;
        } 

        if (server < 1 || server > 8 || isNaN(server)) {
            channel.send({content: `Error: Lookup out of range.`}).catch((err) => {internal_error(err); return});
            console.log(`Error: Command - Admin Online did not have a proper range included.`);
            server = -1;
            return;
        }

        if (args.length > 1) {
            msg.channel.send({content: `No extra arguments needed. Correct usage: \`.exp afk <Server#>\``}).catch((err) => {internal_error(err); return});
            console.log(`Error: Command - AFK was given too many arguments.`);
            return;
        }

        //send afk command
        let rconToSend = `/sc local afk_times, ctn = {}, 0 for _, p in ipairs(game.connected_players) do  afk_times[p.name] = p.afk_time end  rcon.print(game.table_to_json(afk_times))`;

        async function runCommand(server, rcon, msg, internal_error) {
            let json_data;

            try {
                if (!rcon.connected) {
                    const Embed = Discord.MessageEmbed();
                    Embed.addField(`S${server} is not connected to the bot`, `S${server} offline`, false);
                    await msg.channel.send({embeds: [Embed]});
                    return;
                }

                const responses = await rcon.send(rconToSend);

                if (responses) {
                    json_data = JSON.parse(responses);
                } else {
                    const Embed = Discord.MessageEmbed();
                    Embed.addField(`S${server} AFK players`, `requested by ${author}`, false);
                    Embed.addField(`No players online`, `\u200B`, false);
                    await msg.channel.send({embeds: [Embed]});
                }

            } catch (err) {
                return internal_error(err);
            }

            // If Responses is blank (not normal).
            if (!json_data) {
                await msg.channel.send({content: `There was no response from the server, contact an admin to check the logs.`});
                console.log(`Error: Command - AFK did not recieved response from the server, check the logs for details.`);
                return;
            }

            // If repsonse by rcon/factorio exists than runs function "resp" in this case prints the rcon response
            // instead of sucess/fail message *in kicks and bans only if player does nto exist or wrong santax
            if (json_data) {
                const Embed = Discord.MessageEmbed();
                let length = Object.keys(json_data).length;
                if (length === 0) {
                    Embed.addField(`S${server} AFK players`, `requested by ${author}`, false);
                    Embed.addField(`No player online`, `\u200B`, false);
                } else {
                    Embed.addField(`S${server} AFK players`, `requested by ${author} \n \u200B`, false);
                }

                for (let name in json_data) {
                    let time = json_data[name] / 60;
                    let hours = Math.floor(time / 3600);
                    let minutes = Math.floor(time / 60) - (hours * 60);
                    let seconds = Math.floor(time - ((hours * 3600) + (minutes * 60)));

                    if (hours > 0) {
                        Embed.addField(`${name}:`, `${hours}h ${minutes}m ${seconds}s`, false);
                    } else {
                        Embed.addField(`${name}:`, `${minutes}m ${seconds}s`, false);
                    }
                }

                await msg.channel.send({embeds: [Embed]});
            }

        }

        if (server < 9 && server > 0) {
            console.log(`Info: Command - AFK server is ${server}.`);
            runCommand(server, rcons[server], msg, internal_error).catch((err) => {internal_error(err); return});
        }
    },
};
