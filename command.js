const { SlashCommandBuilder } = require('@discordjs/builders');
class Discord_Command {

    constructor(name, callback, flags, args) {
        this.name = name;
        this.run = callback

        this.description = flags.description || 'No description given.'
        this.aka = flags.aka
        this.cooldown = flags.cooldown || 1
        this.cooldown_msg = flags.cooldown_msg || 'Don\'t spawn the bot command please.'
        this.guildOnly = flags.guildOnly

        this.slash = true;
    }

    static roles = {
        staff: "762264452611440653",
        admin: "764526097768644618",
        mod: "762260114186305546",
        board: "765920803006054431"
    }
    
    async add_command(client) {
        let command = new SlashCommandBuilder();
        command.setName(this.name);
        command.setDescription(this.description);
        client.guilds.cache.get('762249085268656178').commands.create(command);
    }

    get usage() {

    }

    execute(interaction) {
        let bound_run = this.run.bind(this);
        bound_run(interaction); 
    }
}

module.exports = Discord_Command;