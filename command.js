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
        this.cooldown = flags.cooldown || 1;
        this.cooldown_msg = flags.cooldown_msg || 'Don\'t spam the bot command please.';

        this.aka = flags.aka;

        this.description = flags.description || 'No description given.';
        this.guildOnly = flags.guildOnly;
        this.required_role = flags.required_role;

        this.args = flags.args;
        this.slash = true;
        this.slashbuilder = new Builders.SlashCommandBuilder();
        this.Subcommands = [];

    }

    static builders = {
        'Boolean': Builders.SlashCommandBooleanOption,
        'Channel': Builders.SlashCommandChannelOption,
        'Integer': Builders.SlashCommandIntegerOption,
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
        'Mentionable': 'addMentionableOption',
        'Role': 'addRoleOption',
        'String': 'addStringOption',
        'User': 'addUserOption',
        'Subcommand': 'addSubcommand',
    };
    
    static roles = {
        staff: '762264452611440653',
        admin: '764526097768644618',
        mod: '762260114186305546',
        board: '765920803006054431'
    };

    static Rcons = [];

    static common_args = {
        'server':  {
            name: 'server',
            description: 'The server to run the command on.',
            usage: '<#number||"all">',
            required: true,
            type: 'String',
            choices: [
                ['Sever 1', '1'],
                ['Sever 2', '2'],
                ['Sever 3', '3'],
                ['Sever 4', '4'],
                ['Sever 5', '5'],
                ['Sever 6', '6'],
                ['Sever 7', '7'],
                ['Sever 8', '8'],
                ['All servers', 'all'],
            ]
        },
        'server_NoAll': {  
            name: 'server',
            description: 'The server to run the command on.',
            usage: '<#number||"all">',
            required: true,
            type: 'String',
            choices: [
                ['Sever 1', '1'],
                ['Sever 2', '2'],
                ['Sever 3', '3'],
                ['Sever 4', '4'],
                ['Sever 5', '5'],
                ['Sever 6', '6'],
                ['Sever 7', '7'],
                ['Sever 8', '8'],
            ]
        }
    };
    static client;


    AddOption(command, arg) {
        if(!Discord_Command.builders[arg.type]) throw new Error('Invalid option type.');

        //add and create the subcommand
        if(arg.type === 'Subcommand') {
            arg.command.slashbuilder = new Builders.SlashCommandSubcommandBuilder();
            arg.command.create_command();
            let builder = arg.command.slashbuilder;
            builder.type = 1;
            this.Subcommands.push(arg.command);

            return command[Discord_Command.addoptions[arg.type]](builder);
        }

        let builder = new Discord_Command.builders[arg.type]();
        if(arg.choices) builder.addChoices(arg.choices);
        builder.setName(arg.name);
        builder.setRequired(arg.required);
        builder.setDescription(arg.description);
        command[Discord_Command.addoptions[arg.type]](builder);
    }

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
        client.guilds.cache.get(process.env.guild).commands.create(this.slashbuilder);
    }

    get usage() {
        let usages = this.args.map((arg) => { 
            return `<${arg.name}:${arg.type}>`;
        });

        return `/${this.name} ${usages.join(' ')}`;
    }

    async authorize(interaction) {
        if(this.required_role){
            let role = await interaction.guild.roles.fetch(this.required_role);
            let allowed = interaction.member.roles.highest.comparePositionTo(role) >= 0;
            if (!allowed) {
                interaction.reply(`You do not have ${role.name} permission.`);
                return false;
            }
        }
        return true;
    }

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

        if(await this.authorize(interaction)) {
            this.execute(interaction).catch(console.error);
        }
    }
}

module.exports = Discord_Command;