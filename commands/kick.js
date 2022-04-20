// @ts-check
const Discord = require('discord.js');
let config = require('./../config');

let DiscordCommand = require('./../command.js');
class Kick extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
        */
        let args = [
            {
                name: 'player',
                description: 'The player to kick',
                required: true,
                type: 'String',
            },
            DiscordCommand.CommonArgs.ServerNoAll,
            {
                name: 'reason',
                description: 'The reason for kicking the player',
                required: false,
                type: 'String',
            },
        ];
        super({
            name: 'kick',
            description: 'Kicks the player from the game',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff,
        });
    }

    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.deferReply();
        let player = interaction.options.getString('player');
        let server = parseInt(interaction.options.getString('server'));
        let reason = interaction.options.getString('reason') || 'No reason given';

        let rcon = DiscordCommand.client.Rcons.GetRcon(server);
        if (!rcon.connected) {
            await interaction.editReply('The server you specified is not connected');
            return;
        }
        await rcon.Send(`/kick ${player} ${reason}`);
        await interaction.editReply(`Kicked ${player} from the S${server} for ${reason}.`);

        const Embed = new Discord.MessageEmbed();
        Embed.addField('Kick', 'A player has been kicked', false);
        Embed.addField('Server Details', `server: S${server}`, false);
        Embed.addField('Player', `${player}`, true);
        Embed.addField('By', `${interaction.member.displayName}`, true);
        Embed.addField('Reason', `${reason}`, true);
        Embed.setColor('#0xffa500');
        let ReportChannel = interaction.guild.channels.cache.get(config.getKey('ReportChannel')); // Reports channel is "368812365594230788" for exp // Reports Channel is "764881627893334047" for test server
        if(!(ReportChannel instanceof Discord.TextChannel || ReportChannel instanceof Discord.ThreadChannel)) return void console.error('Wrong id for report channel');
        await ReportChannel.send({embeds: [Embed]});
    }
}
let command = new Kick();
module.exports = command;