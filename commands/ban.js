
const Discord = require('discord.js');
let Discord_Command = require('./../command.js');
const net = require('net');
let client = new net.Socket();
client.connect('/tmp/banlist_sync.sock', function () {
    console.log('Connected to bansync.');
});
client.setKeepAlive(true);

//set a timeout for 30 sec and then reconect (it will try 5 times then stop);
let amount_of_times = 0;
function reconnect() {
    if (amount_of_times >= 5) return;

    console.log('Reconnecting to bansync in 30sec ');

    setTimeout(function () {
        client.connect('/tmp/banlist_sync.sock', function () {
            console.log('Connected to bansync.');
            amount_of_times = 0;
        });
        client.setKeepAlive(true);
    }, 30000);

    amount_of_times += 1;
}

client.on('close', reconnect);
client.on('error', console.error);

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
            // eslint-disable-next-line no-undef
            required_role: role.staff,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let player = await interaction.options.getString('player_name');
        let reason = await interaction.options.getString('reason') || 'No reason given.';
        if (client.writable) {
            client.once('data', function (data) {
                data = String(data);
                let json_data;
                try {
                    json_data = JSON.parse(data);
                } catch (error) {
                    throw new Error(`received malformed json from bansync ${data}`);
                }
                console.log(`[BAN SYNC] => ${data}`);

                if (json_data.success === true) {
                    interaction.editReply(`${player} was banned on all servers for "${reason}".`);
                } else {
                    interaction.editReply(`Their was an error tyring to ban ${player} with Ban sync trying rcon... (check logs)`);
                    normal_ban(player, reason, interaction);
                    console.error(json_data.error);
                }
            });

            return client.write(JSON.stringify({ request: 'ban-player', player, reason }));
        }else{
            normal_ban(player, reason, interaction);
        }
    }
}

let command = new Ban();
module.exports = command;