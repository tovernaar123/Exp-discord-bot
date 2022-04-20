// @ts-check
let DiscordCommand = require('./../command.js');
let config = require('./../config');
const {format} = require('util');

class Pause extends DiscordCommand {
    constructor() {
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
        ];
        super({
            name: 'pause',
            description: 'Pause the server.',
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
        let res = await rcon.Send('/sc game.tick_paused = true'); // Send command to pause the server

        if (!res) { // this command should not get a reply from the server. The command should print on the ingame server though.
            await rcon.Send(`The server IS PAUSED by a remote admin (${interaction.member.displayName}). Please @staff on the discord if this was done by mistake. -->> http://discord.explosivegaming.nl`);
            await interaction.editReply(`No Error - Thus the game should have been **paused** on S${server}.`);
            console.log(`${interaction.member.displayName} has paused S${server}`);
        } else {
            await interaction.editReply('Command might have failed check logs');
            console.log(`[PAUSE]: ${res}`);
        }
    }
}
let command = new Pause();
module.exports = command;