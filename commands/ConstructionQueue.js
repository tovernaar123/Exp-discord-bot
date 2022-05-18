//@ts-check
let {format} = require('util');
let DiscordCommand = require('./../command.js');
let config = require('./../config');
class Set extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
        */
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
            {
                name: 'queue_parms',
                type: 'Number',
                min: 1,
                max: 20,
                required: true,
                description: 'The value to set the botQueue paramaters too (multiplies with the default).'
            }
        ];
        super({
            name: 'set',
            description: 'Sets the value.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.mod
        });
    }

    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.deferReply();
        let server = parseInt(interaction.options.getString('server'));
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);
        let QueueParms = interaction.options.getNumber('queue_parms ');

        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }

        await rcon.Send(`/sc game.forces["player"].max_successful_attempts_per_tick_per_construction_queue = ${3 * QueueParms}`);
        await rcon.Send(`/sc game.forces["player"].max_failed_attempts_per_tick_per_construction_queue = ${1 * QueueParms}`);
        await interaction.editReply('The values have been adjusted.');
    }
}
let set = new Set();


class Get extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
        */
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
        ];
        super({
            name: 'get',
            description: 'Gets the value',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.mod
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

        let succes = Number(await rcon.Send('/sc rcon.print(game.forces["player"].max_successful_attempts_per_tick_per_construction_queue)'));
        let fail = Number(await rcon.Send('/sc rcon.print(game.forces["player"].max_failed_attempts_per_tick_per_construction_queue)'));

        let succesPrecent = (succes/3)*100;
        let failPrecent = (fail/1)*100;
        await interaction.editReply(`Results: \nSuccessful Attempts Every tick is ${succes} (which is ${succesPrecent}%  of the defualt)\nFailed Attempts Every tick is ${fail} (which is ${failPrecent}%  of the defualt) `);

    }
}
let get = new Get();
class botQueue extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
        */
        let args = [
            {
                type: 'Subcommand',
                command: set
            },
            {
                type: 'Subcommand',
                command: get
            },
        ];
        super({
            name: 'bot_queue',
            description: 'Command to chance and get the successful and failed attempts for every tick.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.mod
        });
    }
}
let command = new botQueue();
module.exports = command;