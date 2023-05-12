//@ts-check
let DiscordCommand = require('./../command.js');

class discord_pin extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]} 
        */
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
    /**
     * @type {import("./../command.js").Execute}
    */ 
    async execute(interaction) {
        await interaction.deferReply();

        let message_id = interaction.options.getString('message_id');
        try{
            let msg = await interaction.channel.messages.fetch(message_id);
            if(!(msg.channel === interaction.channel)) return void await interaction.editReply('Please use this command in the same channel as message.');
            await msg.pin();
            await interaction.editReply(`Message ${message_id} has been pinned in ${msg.channel.name}.`);
        }catch{
            await interaction.editReply(`Invalid message id: ${message_id}.`);
        }
    }
}

let pin = new discord_pin();

class discord_unpin extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]} 
        */
        let args = [
            {
                name: 'message_id',
                description: 'The message to unpin.',
                required: true,
                type: 'String'	
            }
        ];
        super({
            name: 'unpin',
            description: 'Unpins the message by message id.',
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
        
        let message_id = interaction.options.getString('message_id');
        try{
            let msg = await interaction.channel.messages.fetch(message_id);
            if(!(msg.channel === interaction.channel)) return void await interaction.editReply('Please use this command in the same channel as message.');
            await msg.unpin();
            await interaction.editReply(`Message ${message_id} has been unpinned in ${msg.channel.name}.`);
        }catch{
            await interaction.editReply(`Invalid message id: ${message_id}.`);
        }
    }
}
let unpin = new discord_unpin();

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
        let messages = await interaction.channel.messages.fetch({limit: amount});
        await interaction.channel.bulkDelete(messages);
    }
}

let del = new discord_delete();

class Message extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
        */
        let args = [
            {
                type: 'Subcommand',
                command: pin
            },
            {
                type: 'Subcommand',
                command: unpin
            },
            {
                type: 'Subcommand',
                command: del
            },
        ];
        super({
            name: 'message',
            description: 'Discord Message operations.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff
        });
    }
}

let command = new Message();
module.exports = command;