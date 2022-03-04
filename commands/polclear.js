
let Discord_Command = require('./../command.js');
let {format} = require('util');
let config = require.main.require('./config/utils.js');
class Polclear extends Discord_Command {
    constructor() {
        let args = [
            Discord_Command.common_args.server_NoAll,
        ];
        super({
            name: 'polclear',
            aka: [''],
            description: 'Removes the pollution from the server.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            required_role: Discord_Command.roles.staff,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let server = interaction.options.getString('server');
        let rcon = Discord_Command.Rcons[server];
        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }

        //Clear the pollution on the main surface (lua start counting at 1).
        let res = await rcon.send('/sc game.surfaces[1].clear_pollution()'); 
        // this command should not get a reply from the server. The command should print on the ingame server though.
        if (!res) {
            //Send message to the server.
            await rcon.send(`The server had pollution **REMOVED** by ${interaction.member.displayName}. Please @staff on the discord if this was done by mistake.`);
            //Send message to discord.
            await interaction.editReply(`No Error - Thus pollution should have been **removed** on S${server}. Command Requested by *${interaction.member.displayName}*.`);
        } else {
            //Send error message to discord.
            await interaction.editReply(`Command might have failed result: \`\`\` ${res} \`\`\``);
        } 
    }
}
let command = new Polclear();
module.exports = command;