// @ts-check
let DiscordCommand = require('./../command.js');
let {format} = require('util');
let config = require('./../config');
class PollOff extends DiscordCommand {
    constructor() {
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
        ];
        super({
            name: 'poloff',
            description: 'Completely turns off pollution. So no new pollution will be generated.',
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
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);
        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }
        //Disable pollution completely.
        let res = await rcon.Send('/sc game.map_settings.pollution.enabled = false'); 
        // this command should not get a reply from the server. The command should print on the ingame server though.
        if (!res) { 
            //Send message to server.
            await rcon.Send(`The server had pollution **DISABLED** by ${interaction.member.displayName}. Please @staff on the discord if this was done by mistake.`);
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