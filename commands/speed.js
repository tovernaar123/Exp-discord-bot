// @ts-check
let DiscordCommand = require('./../command.js');
let {format} = require('util');
let config = require('./../config');
class Speed extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
         */
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
            {
                name: 'speed',
                description: 'The new speed to set the server to',
                required: true,
                type: 'Number',
                min: 0.1,
                max: 1,
            }
        ];
        super({
            name: 'speed',
            description: 'Set the game speed of the server.',
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
        let speed = interaction.options.getNumber('speed');
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);

        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }
        //Set the game speed
        let res = await rcon.Send(`/c game.speed = ${speed}`);
        // this command should not get a reply from the server. The new game speed should have printed in the map though.
        if (!res) {
            //Send the message to the server.
            await rcon.Send(`The server speed has been set by ${interaction.member.displayName}. Please @staff on the discord if this was done by mistake.`);
            //send the message to the discord.
            await interaction.editReply(`No Error - Thus a new speed of **${speed}** should have been set on S${server}. Speed requested by *${interaction.member.displayName}*.`);
        } else {
            //send error to the discord.
            await interaction.editReply(`Command might have failed result: \`\`\` ${res} \`\`\``);
        } 
    }
}
let command = new Speed();
module.exports = command;