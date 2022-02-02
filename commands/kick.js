
const Discord = require('discord.js');

let Discord_Command = require('./../command.js');
class Kick extends Discord_Command {
    constructor() {
        let args = [
            {
                name: 'player',
                description: 'The player to kick',
                required: true,
                type: 'String',
            },
            Discord_Command.common_args.server_NoAll,
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
            required_role: Discord_Command.roles.staff,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let player = interaction.options.getString('player');
        let server = parseInt(interaction.options.getString('server'));
        let reason = interaction.options.getString('reason') || 'No reason given';

        let rcon = Discord_Command.Rcons[server];
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
        let reportChan = interaction.guild.channels.cache.get('764881627893334047'); // Reports channel is "368812365594230788" for exp // Reports Channel is "764881627893334047" for test server
        await reportChan.send({embeds: [Embed]});
    }
}
let command = new Kick();
module.exports = command;