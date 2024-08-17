// @ts-check

const Builders = require('@discordjs/builders');
let config = require('./config/index.js');
/** @import * as DiscordAPI from "discord.js" */
// const {APIApplicationCommandOptionChoice} = require("discord-api-types/v10/")
config.addKey('roles/staff', '482924291084779532');
config.addKey('roles/admin', '290940523844468738');
config.addKey('roles/mod', '260893080968888321');
config.addKey('roles/board', '693500936491892826');
config.addKey('roles/contributor', '678245941639381010');


/**
 * @template {DiscordCommand} T
 * @typedef {Object} SubcommandArgument 
 * @property {Readonly<'Subcommand'>} type
 * @property {T} command
*/

/**
 * @typedef {Object} NumberArgument 
 * @property {'Number' | 'Integer'} type
 * @property {number} [min]
 * @property {number} [max]
 * @property {readonly (readonly [name: string, value: number])[]}  [choices]
*/

/**
 * @typedef {Object} StringArgument 
 * @property {Readonly<'String'>} type
 * @property {readonly (readonly [name: string, value: string])[]} [choices]
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
*/
/**  
 * @typedef { Readonly<(( NumberArgument | StringArgument | OtherArgument) & Standard) | SubcommandArgument<any>>} Argument
*/


/**
 * @template {readonly Argument[]} T
 * @typedef {Object} Flags 
 * @property {string} name 
 * @property {Number} [cooldown] 
 * @property {String} [cooldown_msg] 
 * @property {String} [description]
 * @property {Boolean} guildOnly
 * @property {String | false} requiredRole
 * @property {T} args
*/

/**
 * Interface for classes that represent a color.
 *
 * @interface Color
 */

/**
 * Get the color as an array of red, green, and blue values, represented as
 * decimal numbers between 0 and 1.
 *
 * @function
 * @name Color
 * @returns {Array<number>} An array containing the red, green, and blue values,
 * in that order.
 */
/**
 * @typedef {function(import("discord.js").ChatInputCommandInteraction<'cached'>): Promise<void>} Execute
*/


/**
 * @typedef {function(import("discord.js").ChatInputCommandInteraction<'cached'>): Promise<Boolean>} Authorize
*/

/**
 * @template T
 * @template V
 * @typedef {keyof { [P in keyof T as T[P] extends V? P: never]: any}} KeyOfType
 */
/**
 * @template {KeyOfType<DiscordAPI.CommandInteractionOptionResolver,(...args: any) => any> } T
 * @typedef {Exclude<ReturnType<DiscordAPI.CommandInteractionOptionResolver[T]>,null>} DiscordOptionReturnType
 */
/**
 * @template T
 * @typedef {(
* T extends "Boolean" ?  DiscordOptionReturnType<'getBoolean'> :
* T extends "Channel" ? DiscordOptionReturnType<'getChannel'>:
* T extends "String" ? DiscordOptionReturnType<'getString'> :
* T extends "Role" ? DiscordOptionReturnType<'getRole'>  :
* T extends "Number" ? DiscordOptionReturnType<'getNumber'>  :
* T extends "Integer" ? DiscordOptionReturnType<'getInteger'>  :
* T extends "User" ? DiscordOptionReturnType<'getUser'> :
* T extends "Subcommand" ? DiscordOptionReturnType<'getSubcommand'> :
* T extends "Mentionable" ? DiscordOptionReturnType<'getMentionable'> : never
* )} TypeStringToType
*/

/**
 * @template T
 * @typedef {T extends { name: infer U } ? U : never} ExtractName
 */

/**
 * @template {readonly any[]} T
 * @typedef {ExtractName<T[number]>} NameTuple
 */

/**
 * @template T
 * @template {string} R
 * @typedef {T extends { name: R, type: infer U } ? U : never }  ExtracttypeFromName
 */



/**
 * @template T
 * @template {string} R
 * @typedef {T extends { name: R, required: infer U } ? U : never }  ExtractRequiredFromName
 */



/**
 * @template {readonly Argument[]} T
 */
class DiscordCommand {
    /**
     * @type {T}
     */
    args;

    argnames;
    /**
    * @param {Flags<T>} flags Sets all the setting of this command.
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
        this.argnames = (this.args.map(
            (command) => {
                if (command.type == 'Subcommand') return /**  @type {NameTuple<T>} */ (command.command.name);
                return /**  @type {NameTuple<T>} */ (command.name);
            }
        ));
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



    static CommonArgs = /** @type {const} */ ({
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
    });

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
            if (arg.choices) builder.addChoices(arg.choices.map((val) => {
                /**
                 * @type {DiscordAPI.APIApplicationCommandOptionChoice<string>}
                 */
                let newval = { name: val[0], value: val[1], name_localizations: null };
                return newval;
            }));
        } else if ((arg.type === 'Number' || arg.type === 'Integer')) {
            builder = new DiscordCommand.builders[arg.type]();
            if (arg.min) builder.setMinValue(arg.min);
            if (arg.max) builder.setMaxValue(arg.max);
            if (arg.choices) builder.addChoices(arg.choices.map((val) => {
                /**
                 * @type {DiscordAPI.APIApplicationCommandOptionChoice<number>}
                 */
                let newval = { name: val[0], value: val[1], name_localizations: null };
                return newval;
            }));
        }
        if (!builder) builder = new DiscordCommand.builders[arg.type]();
        builder.setName(arg.name);
        builder.setRequired(arg.required);
        builder.setDescription(arg.description);
        command[DiscordCommand.addoptions[arg.type]](builder);
    }
    /**
     * @template {NameTuple<T>} U
     * @typedef {TypeStringToType<ExtracttypeFromName<T[number],U>>} ReturnTypeGet
     */
    /**
     * @template {NameTuple<T>} U
     * @typedef {ExtractRequiredFromName<T[Number],U> extends true ? ReturnTypeGet<U>: (ReturnTypeGet<U> | null)} ReturnTypeGetWithReq
     */
    /**
     * @template {NameTuple<T>} U
     * @param {U} name 
     * @param {DiscordAPI.ChatInputCommandInteraction} interaction 
     * @returns {ReturnTypeGetWithReq<U>}
     */
    GetOption(interaction, name) {
        let arg = this.args.filter((argument) => {
            if (argument.type == 'Subcommand') return  (argument.command.name === name);
            return  (argument.name === name);
        })[0].type;
        let ret;
        switch(arg) {
            case 'Boolean':
                ret = interaction.options.getBoolean(name);
                break;
            case 'Channel':
                ret = interaction.options.getChannel(name);
                break;
            case 'Integer':
                ret = interaction.options.getInteger(name);
                break;
            case 'Mentionable':
                ret = interaction.options.getMentionable(name);
                break;
            case 'Number':
                ret = interaction.options.getNumber(name);
                break;
            case 'Role':
                ret = interaction.options.getRole(name);
                break;
            case 'String':
                ret = interaction.options.getString(name);
                break;
            case 'User':
                ret = interaction.options.getUser(name);
                break;
        }
        return /** @type {ReturnTypeGet<U>} */  (ret);
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
        if (this.slashbuilder instanceof Builders.SlashCommandSubcommandBuilder) return console.error('[COMMAND]: Subcommand cant be added without main command.');
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
            if (!role) {
                await interaction.reply('Permission error in fetching role data.');
                return false;
            }
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
    async AutoComplete() {

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
