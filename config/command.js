const Discord_Command = require('./../command.js');

const config = require('./utils.js');

class Create extends Discord_Command {
    constructor() {
        let args = [
            {
                name: 'config',
                description: 'The config to create',
                required: true,
                type: 'String'
            }
        ];
        super({
            name: 'create',
            aka: [''],
            description: 'Create the config file for the bot.',
            cooldown: 5,
            args: args,
            guildOnly: true
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let json = interaction.options.getString('config');

        try{
            json = JSON.parse(json);
        }catch(err){
            return await interaction.editReply(`Invalid JSON. ${err}`);
        }
        let mergeConfig = {
            ...config.defaults,
            ...json
        };

        let missed_keys = [];

        for(const key of config.keys) {
            //if the key is not in the json and has no default value then add it to the list.
            if(!(key in mergeConfig)) {
                missed_keys.push(key);
            }
        }
        if(missed_keys.length > 0) return await interaction.editReply(`Missing key: ${missed_keys.join(', ')}`);
        config.createConfig(mergeConfig);
        await interaction.editReply('Config file created.');
    }
}
let create = new Create();

class Modify extends Discord_Command {
    constructor() {
        let keys = config.keys.map(
            (key) => {
                return [key, key];
            }
        );
        let args = [
            {
                name: 'key',
                description: 'The key to change',
                required: true,
                type: 'String',
                choices: keys
            },
            {
                name: 'value',
                description: 'The value to set the key to',
                required: true,
                type: 'String'
            }
        ];
        super({
            name: 'modify',
            aka: [''],
            description: 'Modifies a key of the config file.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            required_role: Discord_Command.roles.staff,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let key = interaction.options.getString('key');
        let value = interaction.options.getString('value');
        config.setKey(key, value);
        await interaction.editReply('Config file modified.');
    }
}
let modify = new Modify();


class Config_command extends Discord_Command {
    constructor() {
        let args = [
            {
                type: 'Subcommand',
                command: create,
            },
            {
                type: 'Subcommand',
                command: modify,
            }
        ];
        super({
            name: 'config',
            description: 'changes the config',
            args: args,
        });
        
    }
}

let command = new Config_command();
module.exports = command;

