// @ts-check

const Builders = require('@discordjs/builders');
let config = require('./config/index.js');

config.addKey('roles/staff', '482924291084779532');
config.addKey('roles/admin', '290940523844468738');
config.addKey('roles/mod', '260893080968888321');
config.addKey('roles/board', '693500936491892826');
config.addKey('roles/contributor', '678245941639381010');


/**
 * @typedef {Object} SubcommandArgument 
 * @property {'Subcommand'} type
 * @property {DiscordCommand} command
*/

/**
 * @typedef {Object} NumberArgument 
 * @property {'Number' | 'Integer'} type
 * @property {number} [min]
 * @property {number} [max]
 * @property {[name: string, value: number][]}  [choices]
*/

/**
 * @typedef {Object} StringArgument 
 * @property {'String'} type
 * @property {[name: string, value: string][]} [choices]
*/

/**
 * @typedef {Object} OtherArgument
 * @property {'Boolean' | 'Channel' | 'Mentionable'| 'Role' | 'User'} type
*/

/**
 * @typedef {Object} Standard
 * @property {String} name
 * @property {String} description
 * @property {Boolean} required
 *
 * @typedef {((NumberArgument | StringArgument | OtherArgument) & Standard) | SubcommandArgument} Argument
 */


/**
 * @typedef {Object} Flags 
 * @property {string} name 
 * @property {Number} [cooldown] 
 * @property {String} [cooldown_msg] 
 * @property {String} [description]
 * @property {Boolean} guildOnly
 * @property {String | false} requiredRole
 * @property {Argument[]} args
*/


/**
 * @typedef {function(import("discord.js").CommandInteraction<'cached'>): Promise<void>} Execute
*/

/**
 * @typedef {function(import("discord.js").CommandInteraction<'cached'>): Promise<Boolean>} Authorize
*/

class DiscordCommand {


    /**
    * @param {Flags} flags Sets all the setting of this command.
    */
    constructor(flags) {
        this.name = flags.name;
        if (!this.name) throw new Error('Command name is not defined.');

        this.cooldowns = new Map();
        this.cooldown = flags.cooldown || 1;
        this.cooldown_msg = flags.cooldown_msg || 'Don\'t spam the bot command please.';

        this.description = flags.description || 'No description given.';
        this.guildOnly = flags.guildOnly;
        this.requiredRole = flags.requiredRole;

        this.args = flags.args;
        this.slash = true;
        /**
         * @type {Builders.SlashCommandSubcommandBuilder | Builders.SlashCommandBuilder}
        */
        this.slashbuilder = new Builders.SlashCommandBuilder();


        /**
         * @type {DiscordCommand[]}
         */
        this.Subcommands = [];

    }

    /**
     * @readonly
     */
    static builders = {
        'Boolean': Builders.SlashCommandBooleanOption,
        'Channel': Builders.SlashCommandChannelOption,
        'Integer': Builders.SlashCommandIntegerOption,
        'Number': Builders.SlashCommandNumberOption,
        'Mentionable': Builders.SlashCommandMentionableOption,
        'Role': Builders.SlashCommandRoleOption,
        'String': Builders.SlashCommandStringOption,
        'User': Builders.SlashCommandUserOption,
        'Subcommand': Builders.SlashCommandSubcommandBuilder,
    };

    static addoptions = {
        'Boolean': 'addBooleanOption',
        'Channel': 'addChannelOption',
        'Integer': 'addIntegerOption',
        'Number': 'addNumberOption',
        'Mentionable': 'addMentionableOption',
        'Role': 'addRoleOption',
        'String': 'addStringOption',
        'User': 'addUserOption',
        'Subcommand': 'addSubcommand',
    };

    static roles = {
        staff: config.getKey('roles/staff'),
        admin: config.getKey('roles/admin'),
        mod: config.getKey('roles/mod'),
        board: config.getKey('roles/board'),
        contributor: config.getKey('roles/contributor'),
    };

    /**
     * @typedef {Object} CommonArgs 
     * @property {Argument} Server
     * @property {Argument} ServerNoAll
    */

    /**
     * @type {CommonArgs}
    */
    static CommonArgs = {
        'Server': {
            name: 'server',
            description: 'The server to run the command on.',
            required: true,
            type: 'String',
            choices: [
                ['Server 1', '1'],
                ['Server 2', '2'],
                ['Server 3', '3'],
                ['Server 4', '4'],
                ['Server 5', '5'],
                ['Server 6', '6'],
                ['Server 7', '7'],
                ['Server 8', '8'],
                ['All servers', 'all'],
            ]
        },
        'ServerNoAll': {
            name: 'server',
            description: 'The server to run the command on.',
            required: true,
            type: 'String',
            choices: [
                ['Server 1', '1'],
                ['Server 2', '2'],
                ['Server 3', '3'],
                ['Server 4', '4'],
                ['Server 5', '5'],
                ['Server 6', '6'],
                ['Server 7', '7'],
                ['Server 8', '8'],
            ]
        }
    };

    /**
     * @type {import("./infoBot.js").Bot}
     */
    static client;


    /**
     * @param {Builders.SlashCommandBuilder | Builders.SlashCommandSubcommandBuilder} command
     * @param {Argument} arg
     */
    AddOption(command, arg) {
        if (!DiscordCommand.builders[arg.type]) throw new Error('Invalid option type.');
        //add and create the subcommand
        if (arg.type === 'Subcommand') {
            arg.command.slashbuilder = new Builders.SlashCommandSubcommandBuilder();
            arg.command.create_command();
            let builder = arg.command.slashbuilder;
            // @ts-ignore bug in the builder lib that does not set the type of the argument for subcommands
            builder.type = 1;
            this.Subcommands.push(arg.command);

            return command[DiscordCommand.addoptions[arg.type]](builder);
        }

        let builder;

        if (arg.type === 'String') {
            builder = new DiscordCommand.builders[arg.type]();
            if (arg.choices) builder.addChoices(arg.choices);
        } else if ((arg.type === 'Number' || arg.type === 'Integer')) {
            builder = new DiscordCommand.builders[arg.type]();
            if (arg.min) builder.setMinValue(arg.min);
            if (arg.max) builder.setMaxValue(arg.max);
            if (arg.choices) builder.addChoices(arg.choices);
        }
        if(!builder) builder = new DiscordCommand.builders[arg.type]();
        builder.setName(arg.name);
        builder.setRequired(arg.required);
        builder.setDescription(arg.description);
        command[DiscordCommand.addoptions[arg.type]](builder);
    }

    create_command() {
        this.slashbuilder.setName(this.name);
        this.slashbuilder.setDescription(this.description);
        for (let i = 0; i < this.args.length; i++) {
            let arg = this.args[i];
            this.AddOption(this.slashbuilder, arg);
        }
    }

    /**
     * @param {import("./infoBot.js").Bot} client
    */ 

    async add_command(client) {
        this.create_command();
        if(this.slashbuilder instanceof  Builders.SlashCommandSubcommandBuilder) return console.error('[COMMAND]: Subcommand cant be added without main command.');
        // @ts-ignore
        await client.guilds.cache.get(process.env.guild).commands.create(this.slashbuilder);
        console.log(`[COMMAND] added ${this.name}`);
    }

    get usage() {
        let usages = this.args.map((arg) => {
            if (arg.type === 'Subcommand') return;
            return `<${arg.name}:${arg.type}>`;
        });

        return `/${this.name} ${usages.join(' ')}`;
    }

    /**
     * @argument {import("discord.js").CommandInteraction<'cached'>} interaction
     * @returns {Promise<Boolean>}
    */
    async authorize(interaction) {
        if (this.requiredRole) {
            let role = await interaction.guild.roles.fetch(this.requiredRole);
            let allowed;
            if (!('highest' in interaction.member.roles)) return allowed = false;
            else allowed = interaction.member.roles.highest.comparePositionTo(role) >= 0;
            if (!allowed) {
                await interaction.reply(`You do not have ${role.name} permission.`);
                return false;
            }
        }
        return true;
    }

    /**
     * @argument {import("discord.js").CommandInteraction<'cached'>} interaction
    */
    async execute(interaction) { await interaction.reply('not implemented'); }

    /**
     * @argument {import("discord.js").CommandInteraction<'cached'>} interaction
    */
    async _execute(interaction) {
        let cooldown_rec = this.cooldowns.get(interaction.user.id);
        if (cooldown_rec) {
            if (Date.now() - cooldown_rec < this.cooldown * 1000) {
                await interaction.reply(this.cooldown_msg);
                return;
            }
        }
        this.cooldowns.set(interaction.user.id, Date.now());
        console.log('Command: ' + this.name + ' has been executed.');

        if (await this.authorize(interaction)) {
            this.execute(interaction).catch(console.error);
        }
    }
}

module.exports = DiscordCommand;
