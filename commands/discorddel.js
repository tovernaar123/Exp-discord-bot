let DiscordCommand = require('./../command.js');
class discord_delete extends DiscordCommand {
    constructor() {
        let args = [
            {
                name: 'amount',
                description: 'The amount of posts you want to delete.',
                required: true,
                type: 'Integer'	
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

    async execute(interaction) {
        await interaction.deferReply();
        
        let amount = interaction.options.getInteger('amount');
        if (amount > 20) {
            await interaction.editReply('You can`t delete more than 20 messages at once!'); // makes sure less than 20 posts
            return;
        }
        if (amount < 1) {
            await interaction.editReply('You have to delete at least 1 message!'); // makes sure 1 or more posts  
            return;
        }

        let messages = await interaction.channel.messages.fetch({ limit: amount });
        await interaction.channel.bulkDelete(messages);
    }
}


let command = new discord_delete();
module.exports = command;