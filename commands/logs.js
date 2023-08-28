// @ts-check
let DiscordCommand = require('../command.js');
const readline = require('readline');
const fs = require('fs');
const { format } = require('util');


let config = require('./../config');
config.addKey('Logs/Directory');

/**
 * 
 * @param {String} log 
 * @returns {String}
 */
function chat_log(log) {
    /*
        Regex explanation:
        .*? means get any charter until what comes next (\[CHAT\]).
        Just a note the ? in .*? makes the * operator non greedy which is to make sure it does not just grab everything.
        Then we have \[CHAT\] the only thing here is that ] and [ are regex chartes
        so we have to esacpe with \
        Then we have .*?\n which agains get any charter until \n and then it stops as it shood.
    */
    let chat = log.match(/.*?\[CHAT\].*/g);
    if (!chat) return 'no chatlogs found';
    return chat.join('\n');
}

/**
 * @param {string} log
 */
function event_log(log) {
    let data = log.split('\n');
    if (data.length === 1) { data = data[0].split('\r'); }
    let final_message = '';
    for (let i = 0; i < data.length; i++) {
        let line = data[i];
        if (!(line.includes('[CHAT]') || line.includes('[JOIN]') || line.includes('[LEAVE]'))) {
            final_message += `${line}\n`;
        }
    }
    if (final_message === '') {
        return 'No events';
    }
    return final_message;
}


/**
 * @param {String} server
 * @returns {Promise<String[]>}
 */
function getLines(server) {
    return new Promise((resolve,) => {
        let lines = [];
        //mnt/c/programming/tools/factorio_servers/servers/s%s/data/console.log
        //home/factorio/servers/eu-0%s/console.log
        let dir = format(config.getKey('Logs/Directory'), server);
        const rl = readline.createInterface({
            input: fs.createReadStream(dir),
        });

        rl.on('line', line => {
            lines.push(line);
            if (line.startsWith('=')) {
                lines = [];
            }
        });

        rl.on('close', () => {
            resolve(lines);
        });

    });
}


/**
 * @param {string} server
 * @param {number} size
 * @param {import("discord.js").CommandInteraction<'cached'>} msg
 * @param {{(log: string): string}} [parse]
 */
async function get_logs(server, size, msg, parse) {
    /**
     * @type {String | String[]} 
    */
    let lines = await getLines(server);
    lines = lines.join('\n');
    lines = lines.replace(/\[special-item=.*?\]/g, '<blueprint>');
    if (parse) {
        lines = parse(lines.replace(/```/g, ',,,'));
    }
    lines = lines.split('\n');
    lines = lines.slice(-1 * size);

    //Split on enters and limit size per line
    /**
     * @type {string[]}
    */
    let final_lines = [];
    let current_msg = '';
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.length > 500) { //max limit of 500 chars per line
            line = line.replace(/(.*?\[.*?\] .*?:).*/, '$1 <message to long>');
        }

        if (current_msg.length + line.length > 1900) {
            final_lines.push(current_msg);
            current_msg = line + '\n';
        } else {
            current_msg += line + '\n';
        }
    }
    //push the final current_msg
    final_lines.push(current_msg);

    //send the log in the code blocks
    for (let i = 0; i < final_lines.length; i++) {
        await msg.channel.send(`\`\`\`log\n${final_lines[i]}\`\`\``);
    }
}


class chatlog extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
        */
        let args = [
            DiscordCommand.CommonArgs.Server,
            {
                name: 'size',
                description: 'The amount of chat log you want.',
                required: true,
                max: 50,
                min: 10,
                type: 'Integer',
            }
        ];
        super({
            name: 'chat',
            description: 'Will return the chat log of the requested server.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.board,
        });

    }

    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.reply('Getting chatlog...');
        let server = interaction.options.getString('server');
        let size = interaction.options.getInteger('size');
        await get_logs(server, size, interaction, chat_log);
    }

}

class eventlog extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
        */
        let args = [
            DiscordCommand.CommonArgs.Server,
            {
                name: 'size',
                description: 'The amount of event log you want.',
                required: true,
                type: 'Integer',
            }
        ];
        super({
            name: 'event',
            description: 'Will return the event log of the requested server.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.board,
        });

    }

    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.reply('Getting eventlog...');
        let server = interaction.options.getString('server');
        let size = interaction.options.getInteger('size');

        if (size > 50) { size = 50; }
        if (size < 0) { size = 10; }
        await get_logs(server, size, interaction, event_log);
    }

}

class normallog extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
        */
        let args = [
            DiscordCommand.CommonArgs.Server,
            {
                name: 'size',
                description: 'The amount of chat log you want.',
                required: true,
                type: 'Integer',
            }
        ];
        super({
            name: 'normal',
            description: 'Will return the log of the requested server.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.board,
        });

    }
    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.reply('Getting normallog...');
        let server = interaction.options.getString('server');
        let size = interaction.options.getInteger('size');

        if (size > 50) { size = 50; }
        if (size < 0) { size = 10; }
        await get_logs(server, size, interaction);
    }

}

let chat = new chatlog();
let normal = new normallog();
let event = new eventlog();
class log extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
        */
        let args = [
            {
                type: 'Subcommand',
                command: chat,
            },
            {
                type: 'Subcommand',
                command: normal,
            },
            {
                type: 'Subcommand',
                command: event,
            }
        ];
        super({
            name: 'log',
            description: 'Will return the log of the requested server.',
            guildOnly: true,
            args: args,
            requiredRole: DiscordCommand.roles.board
        });

    }
}
let command = new log();
module.exports = command;