// @ts-check
let DiscordCommand = require('./../command.js');
let {format} = require('util');
let config = require('./../config');

class assign_role extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
         */
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
            {
                name: 'name',
                description: 'The name of the player.',
                required: true,
                type: 'String',
            },
            {
                name: 'role',
                description: 'name of role',
                required: true,
                type: 'String',
                choices: [
                    ['regular', 'regular'],
                    ['member', 'member'],
                    ['veteran', 'veteran'],
                    ['sponsor', 'sponsor'],
                    ['supporter', 'supporter'],
                    ['board', 'board']
                ]
            }
        ];
        super({
            name: 'assign_role',
            description: 'Assign role.',
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
        let name = interaction.options.getString('name');
        let role = interaction.options.getString('role');
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);

        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }

        var res = null;

        if (role) {
            res = await rcon.Send(`/interface Roles.assign_player('${name}', '${role}')`);
        }
        
        if (res === 'Command Complete\n') {
            //send the message to the discord.
            await interaction.editReply(`Assigned ${role} to ${name}`);
        } else {
            //send error to the discord.
            await interaction.editReply(`Command might have failed result: \`\`\` ${res} \`\`\``);
        } 
    }
}
let assign = new assign_role();

class unassign_role extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
         */
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
            {
                name: 'name',
                description: 'The name of the player.',
                required: true,
                type: 'String',
            },
            {
                name: 'role',
                description: 'name of role',
                required: true,
                type: 'String',
                choices: [
                    ['regular', 'regular'],
                    ['member', 'member'],
                    ['veteran', 'veteran'],
                    /*
                    ['sponsor', 'sponsor'],
                    ['supporter', 'supporter'],
                    ['board', 'board']
                    */
                ]
            }
        ];
        super({
            name: 'unassign_role',
            description: 'Unassign role.',
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
        let name = interaction.options.getString('name');
        let role = interaction.options.getString('role');
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);

        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }

        var res = null;

        if (role) {
            res = await rcon.Send(`/interface Roles.unassign_player('${name}', '${role}')`);
        }
        
        if (res === 'Command Complete\n') {
            //send the message to the discord.
            await interaction.editReply(`Removed ${role} from ${name}.`);
        } else {
            //send error to the discord.
            await interaction.editReply(`Command might have failed result: \`\`\` ${res} \`\`\``);
        } 
    }
}
let unassign = new unassign_role();

class Roles extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
        */
        let args = [
            {
                type: 'Subcommand',
                command: assign
            },
            {
                type: 'Subcommand',
                command: unassign
            }
        ];
        super({
            name: 'role',
            description: 'Factorio Server role.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff
        });
    }
}

let command = new Roles();
module.exports = command;
