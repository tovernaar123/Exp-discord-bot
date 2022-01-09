let Discord_Command = require('./../command.js');
class Jail extends Discord_Command {
    constructor() {
        let args = [
            Discord_Command.common_args.server_NoAll,
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
            aka: ['jails'],
            description: 'This command jails the player on the server specified',
            cooldown: 5,
            args: args,
            guildOnly: true
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let server = interaction.options.getString('server');
        let tojail = interaction.options.getString('tojail');
        let reason = interaction.options.getString('reason');
        if(tojail.match(/\\|"|'/)){
            return await interaction.editReply('You cannot use " , \\ or \' in the name of the player.');
        }
        if(reason.match(/\\|"|'/)){
            return await interaction.editReply('You cannot use " , \\ or \' in the reason.');
        }

        let rcon = Discord_Command.Rcons[parseInt(server)];

        if (!rcon.connected) {
            await interaction.editReply(`S${server} is not connected the bot.`);
            return;
        }
        let res = await rcon.send(`/interface require("modules.control.jail").jail_player("${tojail}", "${interaction.member.displayName}", "${reason}")`);
        if (res === 'Command Complete\n') {
            await interaction.editReply(`**${tojail}** has been jailed on S${server} for *${reason}*.`);
        } else {
            await interaction.editReply(`Command might have failed result: \`\`\`${res}\`\`\``);
        }
    }
}
let command = new Jail();
module.exports = command;