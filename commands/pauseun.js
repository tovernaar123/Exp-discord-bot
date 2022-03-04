
let Discord_Command = require('./../command.js');
let config = require.main.require('./config/utils.js');
const {format} = require('util');

class Unpause extends Discord_Command {
    constructor() {
        let args = [
            Discord_Command.common_args.server_NoAll,
        ];
        super({
            name: 'unpause',
            aka: [''],
            description: 'Unpauses the server.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            required_role: Discord_Command.roles.board,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let server = interaction.options.getString('server');
        let rcon = Discord_Command.Rcons[server];
        if (!rcon.connected) {
            await interaction.editReply(format(config.getkey('ServerNotConnected'), server));
            return;
        }
        let res = await rcon.send('/sc game.tick_paused = false'); // Send command to pause the server

        if (!res) { // this command should not get a reply from the server. The command should print on the ingame server though.

            await rcon.send('UNpaused the server.');
            await interaction.editReply(`No Error - Thus the game should have been **UN**paused on S${server}.`);
            console.log(`${interaction.member.displayName} has paused S${server}`);
        } else {
            await interaction.editReply('Command might have failed check logs');
            console.log(res);
        }
    }
}
let command = new Unpause();
module.exports = command;