const Discord = require('discord.js');
let Discord_Command = require('./../command.js');
let rconToSend = '/sc local afk_times, ctn = {}, 0 for _, p in ipairs(game.connected_players) do  afk_times[p.name] = p.afk_time end  rcon.print(game.table_to_json(afk_times))'; //send afk chat bot

function TimeObject(time) {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor(time / 60) - (hours * 60);
    let seconds = Math.floor(time - ((hours * 3600) + (minutes * 60)));
    return { hours, minutes, seconds };

}

async function runCommand(server, rcon) {
    let json_data;
    let embedfields = [];
    if (!rcon.connected) {
        embedfields.push({ name: `S${server} is not connected to the bot`, value: `S${server} offline`, inline: true });
        return embedfields;
    }

    const responses = await rcon.send(rconToSend);

    if (responses) {
        try {
            json_data = JSON.parse(responses);
        } catch {
            throw new Error('Malformed json in afk command');
        }
    }

    if (!responses || Object.keys(json_data)?.length === 0) {
        embedfields.push({ name: `S${server}:`, value: 'No players online', inline: true });
        return embedfields;
    }

    // If repsonse by rcon/factorio exists than runs function "resp" in this case prints the rcon response instead of sucess/fail message *in kicks and bans only if player does nto exist or wrong santax
    if (json_data) {
        for (let name in json_data) {
            let time = json_data[name] / 60; //this is uses tick and the game runs at 60ups
            let { hours, minutes, seconds } = TimeObject(time);
            if (hours > 0) {
                embedfields.push({ name: `S${server}:`, value: `${name}: ${hours}h, ${minutes}m and ${seconds}s`, inline: true });
            } else {
                embedfields.push({ name: `S${server}:`, value: `${name}: ${minutes}m and ${seconds}s`, inline: true });
            }
        }
    }
    return embedfields;
}


async function all_servers(rcons, interaction) {
    const Embed = Discord.MessageEmbed();

    let amount_of_fields = 0;
    for (let i = 1; i < rcons.length; i++) {
        let res = await runCommand(i, rcons[i], interaction);
        Embed.addFields(...res);
        amount_of_fields += 1;
    }

    let amount_of_empty_spaces = 3 - (amount_of_fields % 3);
    for (let i = 0; i < amount_of_empty_spaces; i++) {
        //add and empty to make it look nice 
        Embed.addField('\u200B', '\u200B', true);
    }
    await interaction.editReply({ embeds: [Embed] });
}

class Afk extends Discord_Command {
    constructor() {
        let args = [
            Discord_Command.common_args.server
        ];
        super({
            name: 'afk',
            aka: ['whoisafk', 'afkstreak', 'alwaysafk'],
            description: 'Get the afk players on the server.',
            cooldown: 5,
            args: args,
            guildOnly: true
        });
    }

    async execute(interaction) {
        await interaction.deferReply();

        let server = interaction.options.getString('server');
        if (server === 'all') {
            await all_servers(Discord_Command.Rcons, interaction).catch(console.error);
        } else {
            server = parseInt(server);
            let res = await runCommand(server, Discord_Command.Rcons[server], interaction).catch(console.error);
            const Embed = Discord.MessageEmbed();
            Embed.addFields(...res);
            await interaction.editReply({ embeds: [Embed] });
        }
    }
}


let command = new Afk();
module.exports = command;