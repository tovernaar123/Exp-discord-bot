let Discord_Command = require('./../command.js');
class Unjail extends Discord_Command {
    constructor() {
        let args = [
            {
                name: 'player',	
                description: 'The player to unjail',
                required: true,
                type: 'String'
            },
            Discord_Command.common_args.server_NoAll,
        ];
        super({
            name: 'unjail',
            aka: [''],
            description: 'Unjails the player on the server.',
            cooldown: 5,
            args: args,
            guildOnly: true
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let server = interaction.options.getString('server');
        let player = interaction.options.getString('player');
        let rcon = Discord_Command.Rcons[server];

        if (!rcon.connected) {
            await interaction.editReply(`S${server} is not connected the bot.`);
            return;
        }
        let res = await rcon.send(`/unjail ${player}`);
        if (res === 'Command Complete\n') {
            await interaction.editReply(`**${player}** has been unjailed on S${server}`);
        } else {
            await interaction.editReply(`Command might have failed result: \`\`\`${res}\`\`\``);
        }
    }
}
let command = new Unjail();
module.exports = command;