
const Discord = require('discord.js');
let Discord_Command = require('./../command.js');
const net = require('net');
let client = new net.Socket();


function GetReport(server, by_player, banned, reason) {
    let ban_report = new Discord.MessageEmbed();
    ban_report.addField('Ban', 'A player has been Banned', false);
    ban_report.addField('Server Details', `server: S${server}`, false);
    ban_report.addField('Player', `${banned}`, true);
    ban_report.addField('By', `${by_player}`, true);
    ban_report.addField('Reason', `${reason}`, true);
    ban_report.setColor('0xb40e0e');
    return ban_report;
}

async function normal_ban(player, reason, interaction) {
    let server;
    let rcon = Discord_Command.Rcons.find((rcon, index) => {
        server = index;
        return rcon?.connected;
    });

    if (rcon) {
        rcon.send(`/ban ${player} ${reason}`);
        let ReportChannel = interaction.guild.channels.cache.get('368812365594230788'); // Reports channel is "368812365594230788" for exp // Reports Channel is "764881627893334047" for test server
        let report = GetReport(server, interaction.user.username, player, reason);
        interaction.editReply(`Player was banned for "${reason}" (but Ban sync failed) check S${server} to make sure it worked.`);
        ReportChannel.send({ embeds: [report] });
    }
}


class Ban extends Discord_Command {
    constructor() {
        let args = [
            {
                name: 'player_name',
                description: 'The player to ban.',
                usage: '<#string>',
                required: true,
                type: 'String',
            },
            {
                name: 'reason',
                description: 'The reason why you are banning this player.',
                usage: '<#string>',
                required: false,
                type: 'String',
            }
        ];
        super({
            name: 'ban',
            description: 'Will ban player on every server.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            required_role: Discord_Command.roles.staff,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let player = interaction.options.getString('player_name');
        let reason = interaction.options.getString('reason') || 'No reason given.';
        client.connect('/tmp/banlist_sync.sock', function () {
            client.write(JSON.stringify({ request: 'ban-player', player, reason }));
            client.once('data', async function (data) {
                data = String(data);
                let json_data;
                try {
                    json_data = JSON.parse(data);
                } catch (error) {
                    client.end();
                    throw new Error(`received malformed json from bansync ${data}`);
                }
                console.log(`[BAN SYNC] => ${data}`);
    
                if (json_data.success === true) {
                    await interaction.editReply(`${player} was banned on all servers for "${reason}".`);
                    let ReportChannel = interaction.guild.channels.cache.get('368812365594230788'); // Reports channel is "368812365594230788" for exp // Reports Channel is "764881627893334047" for test server
                    let report = GetReport('<internal>', interaction.user.username, player, reason);
                    ReportChannel.send({ embeds: [report] });
                } else {
                    await interaction.editReply(`Their was an error tyring to ban ${player} with Ban sync trying rcon... (check logs)`);
                    normal_ban(player, reason, interaction);
                    console.error(json_data.error);
                }
                client.end();
            });
            client.on('error', function (error) {
                console.error(error);
                client.destroy();
                normal_ban(player, reason, interaction);
            });
        });
    }
}

let command = new Ban();
module.exports = command;