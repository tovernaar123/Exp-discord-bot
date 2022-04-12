
let DiscordCommand = require('./../command.js');
let {format} = require('util');
let config = require.main.require('./config/utils.js');
class PollOff extends DiscordCommand {
    constructor() {
        let args = [
            DiscordCommand.common_args.server_NoAll,
        ];
        super({
            name: 'poloff',
            aka: [''],
            description: 'Completely turns off pollution. So no new pollution will be generated.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let server = interaction.options.getString('server');
        let rcon = DiscordCommand.Rcons[server];
        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }
        //Disable pollution completely.
        let res = await rcon.send('/sc game.map_settings.pollution.enabled = false'); 
        // this command should not get a reply from the server. The command should print on the ingame server though.
        if (!res) { 
            //Send message to server.
            await rcon.send(`The server had pollution **DISABLED** by ${interaction.member.displayName}. Please @staff on the discord if this was done by mistake.`);
            //Send message to discord.
            await interaction.editReply(`No Error - Thus pollution should have been **disabled** on S${server}. Command Requested by *${interaction.member.displayName}*.`);
        } else {
            //Send error to discord.
            await interaction.editReply(`Command might have failed result: \`\`\` ${res} \`\`\``);
        } 
    }
}
let command = new PollOff();
module.exports = command;