let DiscordCommand = require('./../command.js');

class discord_pin extends DiscordCommand {
    constructor() {
        let args = [
            {
                name: 'message_id',
                description: 'The message to pin.',
                required: true,
                type: 'String'	
            }
        ];
        super({
            name: 'pin',
            description: 'Pins the message by message id.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        
        let message_id = interaction.options.getString('message_id');
        try{
            let msg = await interaction.channel.messages.fetch(message_id);
            await msg.pin();
            await interaction.editReply(`Message ${message_id} has been pinned in ${msg.channel.name}.`);
        }catch{
            await interaction.editReply(`Invalid message id: ${message_id}.`);
        }
    }
}


let command = new discord_pin();
module.exports = command;