// @ts-check
let DiscordCommand = require('./../command.js');
class discord_delete extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
         */
        let args = [
            {
                name: 'amount',
                description: 'The amount of posts you want to delete.',
                max: 20,
                min: 1,
                required: true,
                type: 'Integer',
            }
        ];
        super({
            name: 'delete',
            description: 'Delets the requested amount of posts in this channel.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.admin,
        });
    }

    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.deferReply();
        
        let amount = interaction.options.getInteger('amount');
        let messages = await interaction.channel.messages.fetch({ limit: amount });
        await interaction.channel.bulkDelete(messages);
    }
}


let command = new discord_delete();
module.exports = command;