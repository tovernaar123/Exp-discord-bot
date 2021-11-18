const Builders = require('@discordjs/builders');

class Discord_Command {


    /**
    * @param {object} flags Sets all the setting of this command.
    * @param {object} args The argument this command needs.
    * @returns {void}
    */
    constructor(flags) {
        this.name = flags.name;
        if(!this.name) throw new Error('Command name is not defined.');

        this.cooldowns = new Map();
        this.cooldown = flags.cooldown || 1
        this.cooldown_msg = flags.cooldown_msg || 'Don\'t spam the bot command please.'

        this.aka = flags.aka

        this.description = flags.description || 'No description given.'
        this.guildOnly = flags.guildOnly

        this.args = flags.args
        this.slash = true;
    }

    static roles = {
        staff: "762264452611440653",
        admin: "764526097768644618",
        mod: "762260114186305546",
        board: "765920803006054431"
    }

    static Rcons = []

    async add_command(client) {
        let command = new Builders.SlashCommandBuilder();
        command.setName(this.name);
        command.setDescription(this.description);
        for(let i = 0; i < this.args.length; i++) {
            let arg = this.args[i];
            if(arg.type === 'string') {
                let builder =  new Builders.SlashCommandStringOption();
                builder.setName(arg.name);
                builder.setRequired(arg.required);
                command.addStringOption(builder);
            }
        }

        client.guilds.cache.get(process.env.guild).commands.create(command);
    }

    get usage() {
        let usages = this.args.map((arg) => { return arg.usage});

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