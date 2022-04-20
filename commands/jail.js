// @ts-check
let DiscordCommand = require('./../command.js');
class Jail extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
        */
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
            {
                name: 'tojail',
                type: 'String',
                required: true,
                description: 'The user to jail.',
            },
            {
                name: 'reason',
                type: 'String',
                required: true,
                description: 'The reason for the jail.',
            }
        ];
        super({
            name: 'jail',
            description: 'This command jails the player on the server specified',
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
        let tojail = interaction.options.getString('tojail');
        let reason = interaction.options.getString('reason');
        if(tojail.match(/\\|"|'/)){
            return void await interaction.editReply('You cannot use " , \\ or \' in the name of the player.');
        }
        if(reason.match(/\\|"|'/)){
            return void await interaction.editReply('You cannot use " , \\ or \' in the reason.');
        }

        let rcon = DiscordCommand.client.Rcons.GetRcon(server);

        if (!rcon.connected) {
            await interaction.editReply(`S${server} is not connected the bot.`);
            return;
        }
        let res = await rcon.Send(`/interface require("modules.control.jail").jail_player("${tojail}", "${interaction.member.displayName}", "${reason}")`);
        if (res === 'Command Complete\n') {
            await interaction.editReply(`**${tojail}** has been jailed on S${server} for *${reason}*.`);
        } else {
            await interaction.editReply(`Command might have failed result: \`\`\`${res}\`\`\``);
        }
    }
}
let command = new Jail();
module.exports = command;