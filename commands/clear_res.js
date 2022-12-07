// @ts-check
let DiscordCommand = require('./../command.js');
let {format} = require('util');
let config = require('./../config');
class CancelRes extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
         */
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
            {
                name: 'type',
                description: 'type of cancel',
                required: true,
                type: 'Integer',
                choices: [
                    ['current', 1],
                    ['all', 2]
                ]
            }
        ];
        super({
            name: 'cancelres',
            description: 'Cancel existing research of the server.',
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
        let server = parseInt(interaction.options.getString('server'));
        let ctype = parseInt(interaction.options.getString('type'));
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);

        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }

        var res = null

        if (ctype == 1) {
            res = await rcon.Send(`/interface game.forces.player.cancel_current_research()`);
        } else if (ctype == 2) {
            res = await rcon.Send(`/interface game.forces.player.research_queue = nil`);
        }
        
        if (!res) {
            //Send the message to the server.
            await rcon.Send(`The existing server research has been cancelled by ${interaction.member.displayName}. Please @staff on the discord if this was done by mistake.`);
            //send the message to the discord.
            await interaction.editReply(`No Error - Existing research should have been cancelled on S${server}. Action requested by *${interaction.member.displayName}*.`);
        } else {
            //send error to the discord.
            await interaction.editReply(`Command might have failed result: \`\`\` ${res} \`\`\``);
        } 
    }
}
let command = new CancelRes();
module.exports = command;
