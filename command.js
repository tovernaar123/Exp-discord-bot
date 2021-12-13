const Builders = require('@discordjs/builders');

class Discord_Command {


    /**
    * @param {object} flags Sets all the setting of this command.
    * @param {object} args The argument this command needs.
    * @returns {void}
    */
    constructor(flags) {
        this.name = flags.name;
        if (!this.name) throw new Error('Command name is not defined.');

        this.cooldowns = new Map();
        this.cooldown = flags.cooldown || 1
        this.cooldown_msg = flags.cooldown_msg || 'Don\'t spam the bot command please.'

        this.aka = flags.aka

        this.description = flags.description || 'No description given.'
        this.guildOnly = flags.guildOnly

        this.args = flags.args
        this.slash = true;
        this.slashbuilder = new Builders.SlashCommandBuilder();
    }

    static builders = {
        "Boolean": Builders.SlashCommandBooleanOption,
        "Channel": Builders.SlashCommandChannelOption,
        "Integer": Builders.SlashCommandIntegerOption,
        "Mentionable": Builders.SlashCommandMentionableOption,
        "Role": Builders.SlashCommandRoleOption,
        "String": Builders.SlashCommandStringOption,
        "User": Builders.SlashCommandUserOption,	
    }

    static addoptions = {
        "Boolean": "addBooleanOption",
        "Channel": "addChannelOption",
        "Integer": "addIntegerOption",
        "Mentionable": "addMentionableOption",
        "Role": "addRoleOption",
        "String": "addStringOption",
        "User": "addUserOption",
    }
    
    AddOption(command, arg) {
        if(!Discord_Command.builders[arg.type]) throw new Error('Invalid option type.');

        let builder = new Discord_Command.builders[arg.type]();
        if(arg.choices) builder.addChoices(arg.choices);
        builder.setName(arg.name);
        builder.setRequired(arg.required);
        builder.setDescription(arg.description);
        command[Discord_Command.addoptions[arg.type]](builder);
    }

    static roles = {
        staff: "762264452611440653",
        admin: "764526097768644618",
        mod: "762260114186305546",
        board: "765920803006054431"
    }

    static Rcons = []

    async create_command() {
        this.slashbuilder.setName(this.name);
        this.slashbuilder.setDescription(this.description);
        for (let i = 0; i < this.args.length; i++) {
            let arg = this.args[i];
            this.AddOption(this.slashbuilder, arg);
        }
    }

    async add_command(client) {
        this.create_command();
        client.guilds.cache.get(process.env.guild).commands.create( this.slashbuilder);
    }

    get usage() {
        let usages = this.args.map((arg) => { return arg.usage });

        return `/${this.name} ${usages.join(' ')}`
    }

    async execute(interaction) {
        let cooldown_rec = this.cooldowns.get(interaction.user.id)
        if (cooldown_rec) {
            if (Date.now() - cooldown_rec < this.cooldown * 1000) {
                await interaction.reply(this.cooldown_msg);
                return false
            }
        }
        this.cooldowns.set(interaction.user.id, Date.now());
        console.log('Command: ' + this.name + ' has been executed.');
        return true;
    }
}

module.exports = Discord_Command;