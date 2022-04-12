
const Discord = require('discord.js');
let config = require.main.require('./config/utils.js');

let DiscordCommand = require('./../command.js');
class Kick extends DiscordCommand {
    constructor() {
        let args = [
            {
                name: 'player',
                description: 'The player to kick',
                required: true,
                type: 'String',
            },
            DiscordCommand.common_args.server_NoAll,
            {
                name: 'reason',
                description: 'The reason for kicking the player',
                required: false,
                type: 'String',
            },
        ];
        super({
            name: 'kick',
            aka: [''],
            description: 'Kicks the player from the game',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let player = interaction.options.getString('player');
        let server = parseInt(interaction.options.getString('server'));
        let reason = interaction.options.getString('reason') || 'No reason given';

        let rcon = DiscordCommand.Rcons[server];
        if (!rcon) {
            await interaction.editReply('The server you specified is not connected');
            return;
        }
        await rcon.send(`/kick ${player} ${reason}`);
        await interaction.editReply(`Kicked ${player} from the S${server} for ${reason}.`);

        const Embed = Discord.MessageEmbed();
        Embed.addField('Kick', 'A player has been kicked', false);
        Embed.addField('Server Details', `server: S${server}`, false);
        Embed.addField('Player', `${player}`, true);
        Embed.addField('By', `${interaction.member.displayName}`, true);
        Embed.addField('Reason', `${reason}`, true);
        Embed.setColor('0xffa500');
        let reportChan = interaction.guild.channels.cache.get(config.getKey('ReportChannel')); // Reports channel is "368812365594230788" for exp // Reports Channel is "764881627893334047" for test server
        await reportChan.send({embeds: [Embed]});
    }
}
let command = new Kick();
module.exports = command;