let DiscordCommand = require('./../command.js');
let {format} = require('util');
let config = require.main.require('./config/utils.js');
class Speed extends DiscordCommand {
    constructor() {
        let args = [
            DiscordCommand.common_args.server_NoAll,
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
            aka: [''],
            description: 'Set the game speed of the server.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let server = interaction.options.getString('server');
        let speed = interaction.options.getNumber('speed');
        let rcon = DiscordCommand.Rcons[server];

        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }
        //Set the game speed
        let res = await rcon.send(`/c game.speed = ${speed}`);
        // this command should not get a reply from the server. The new game speed should have printed in the map though.
        if (!res) {
            //Send the message to the server.
            await rcon.send(`The server speed has been set by ${interaction.member.displayName}. Please @staff on the discord if this was done by mistake.`);
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