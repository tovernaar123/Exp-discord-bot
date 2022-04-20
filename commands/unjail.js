// @ts-check
let DiscordCommand = require('./../command.js');
let {format} = require('util');
let config = require('./../config');
class Unjail extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
         */
        let args = [
            {
                name: 'player',	
                description: 'The player to unjail',
                required: true,
                type: 'String'
            },
            DiscordCommand.CommonArgs.ServerNoAll,
        ];
        super({
            name: 'unjail',
            description: 'Unjails the player on the server.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff
        });
    }

    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.deferReply();
        let server = parseInt(interaction.options.getString('server'));
        let player = interaction.options.getString('player');
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);

        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }
        let res = await rcon.Send(`/unjail ${player}`);
        if (res === 'Command Complete\n') {
            await interaction.editReply(`**${player}** has been unjailed on S${server}`);
        } else {
            await interaction.editReply(`Command might have failed result: \`\`\`${res}\`\`\``);
        }
    }
}
let command = new Unjail();
module.exports = command;