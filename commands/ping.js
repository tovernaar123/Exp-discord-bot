// @ts-check
let DiscordCommand = require('./../command.js');

class Ping extends DiscordCommand {
    constructor() {
        super({
            name: 'ping',
            description: 'Bot will reply with a pong if you wish to test that it is online and responding to proper commands.',
            cooldown: 5,
            cooldown_msg: 'I don\'t really want to ping you this much :).',
            guildOnly: false,
            requiredRole: false,
            args: [],
        });
    }
    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.reply('Ping?, Ping what?... \n I mean Pong..');
    }
	
}


let command = new Ping();

module.exports = command;

