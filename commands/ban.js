
const Discord = require('discord.js');
let Discord_Command = require('./../command.js');
const net = require('net');
let client = new net.Socket();

let config = require.main.require('./config/utils.js');
config.addKey('BanSync/Sokect', '/tmp/banlist_sync.sock');


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
        await rcon.send(`/ban ${player} ${reason}`);
        let ReportChannel = interaction.guild.channels.cache.get(config.getKey('ReportChannel')); // Reports channel is "368812365594230788" for exp // Reports Channel is "764881627893334047" for test server
        let report = GetReport(server, interaction.user.username, player, reason);
        await interaction.editReply(`Player was banned for "${reason}" (but Ban sync failed) check S${server} to make sure it worked.`);
        await ReportChannel.send({ embeds: [report] });
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
        client.connect(config.getKey('BanSync/Sokect'), function () {
            let message = JSON.stringify({ request: 'ban-player', player, reason });
            console.log(`[BAN SYNC] <= ${message}`);
            //Send the message (request for unban).
            client.write(message);
            //listen for the response (just once).
            client.once('data', async function (data) {
                //convert the data to a string.
                data = String(data);
                let json_data;
                //try to parse the data as json.
                try {
                    json_data = JSON.parse(data);
                    if (!json_data) throw new Error('No data recieved');
                } catch (error) {
                    //if the data is not json, then throw error. (and end the connection).
                    client.end();
                    throw new Error(`received malformed json from bansync ${data}`);
                }
                //Show the raw data in the console.
                console.log(`[BAN SYNC] => ${data}`);

                //if success the player has been unbanned. (else try to unban the player on the normal way).
                if (json_data.success === true) {
                    //Send the message to the discord.
                    await interaction.editReply(`${player} was banned on all servers for "${reason}".`);
                    //Get the report channel to send the report to.
                    let ReportChannel = await interaction.guild.channels.cache.get(config.getKey('ReportChannel')); // Reports channel is "368812365594230788" for exp // Reports Channel is "764881627893334047" for test server
                    //Create the embed to send.
                    let report = GetReport('<internal>', interaction.member.displayName, player, reason);
                    //Send the report to the report channel.
                    await ReportChannel.send({ embeds: [report] });
                } else {
                    //try to unban the player on the normal way.
                    await interaction.editReply(`Their was an error tyring to ban ${player} with Ban sync trying rcon... (check logs)`);
                    await normal_ban(player, reason, interaction);
                    //Show the error in the console.
                    console.error(`[BAN SYNC] => ${json_data.error}`);
                }
                client.end();
            });
        });
        client.on('error', function (error) {
            console.error(`[BAN SYNC] => ${error}`);
            client.destroy();
            //try to unban the player on the normal way.
            //requires a catch to prevent the error from being thrown (if something goes wrong) since normal ban is async.
            normal_ban(player, reason, interaction).catch((normal_error) => {
                console.error(`[NORMAl BAN] => ${normal_error}`);
                interaction.editReply(`Their was a problem trying to ban ${player}. They player has (most probibly) **NOT** been banned.`).catch(
                    //If even this fails, the bot is broken and to prevent further damage, the bot will kill itself.
                    process.exit
                );
            });
        });
    }
}

let command = new Ban();
module.exports = command;