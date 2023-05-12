//@ts-check
let {format} = require('util');
let DiscordCommand = require('./../command.js');
let config = require('./../config');

class Pause extends DiscordCommand {
    constructor() {
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
        ];
        super({
            name: 'pause',
            description: 'Pause the server.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff
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
        let res = await rcon.Send('/sc game.tick_paused = true'); // Send command to pause the server

        if (!res) { // this command should not get a reply from the server. The command should print on the ingame server though.
            await rcon.Send(`The server IS PAUSED by a remote admin (${interaction.member.displayName}). Please @staff on the discord if this was done by mistake. -->> http://discord.explosivegaming.nl`);
            await interaction.editReply(`No Error - Thus the game should have been **paused** on S${server}.`);
            console.log(`${interaction.member.displayName} has paused S${server}`);
        } else {
            await interaction.editReply('Command might have failed check logs');
            console.log(`[PAUSE]: ${res}`);
        }
    }
}

let pause = new Pause();

class Unpause extends DiscordCommand {
    constructor() {
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
        ];
        super({
            name: 'unpause',
            description: 'Unpause the server.',
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
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);
        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }
        let res = await rcon.Send('/sc game.tick_paused = false'); // Send command to pause the server

        if (!res) { // this command should not get a reply from the server. The command should print on the ingame server though.
            await rcon.Send('UNpaused the server.');
            await interaction.editReply(`No Error - Thus the game should have been **UN**paused on S${server}.`);
            console.log(`${interaction.member.displayName} has paused S${server}`);
        } else {
            await interaction.editReply('Command might have failed check logs');
            console.log(res);
        }
    }
}

let unpause = new Unpause();

class Speed extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
         */
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
            {
                name: 'speed',
                description: 'The new speed to set the server to',
                required: true,
                type: 'Number',
                min: 0.1,
                max: 1,
            }
        ];
        super({
            name: 'speed',
            description: 'Set the game speed of the server.',
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
        let speed = interaction.options.getNumber('speed');
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);

        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }
        //Set the game speed
        let res = await rcon.Send(`/c game.speed = ${speed}`);
        // this command should not get a reply from the server. The new game speed should have printed in the map though.
        if (!res) {
            //Send the message to the server.
            await rcon.Send(`The server speed has been set by ${interaction.member.displayName}. Please @staff on the discord if this was done by mistake.`);
            //send the message to the discord.
            await interaction.editReply(`No Error - Thus a new speed of **${speed}** should have been set on S${server}. Speed requested by *${interaction.member.displayName}*.`);
        } else {
            //send error to the discord.
            await interaction.editReply(`Command might have failed result: \`\`\` ${res} \`\`\``);
        } 
    }
}

let speed = new Speed();

class Polclear extends DiscordCommand {
    constructor() {
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
        ];
        super({
            name: 'polclear',
            description: 'Removes the pollution from the server.',
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
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);
        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }

        //Clear the pollution on the main surface (lua start counting at 1).
        let res = await rcon.Send('/sc game.surfaces[1].clear_pollution()'); 
        // this command should not get a reply from the server. The command should print on the ingame server though.
        if (!res) {
            //Send message to the server.
            await rcon.Send(`The server had pollution **REMOVED** by ${interaction.member.displayName}. Please @staff on the discord if this was done by mistake.`);
            //Send message to discord.
            await interaction.editReply(`No Error - Thus pollution should have been **removed** on S${server}. Command Requested by *${interaction.member.displayName}*.`);
        } else {
            //Send error message to discord.
            await interaction.editReply(`Command might have failed result: \`\`\` ${res} \`\`\``);
        } 
    }
}
let polclr = new Polclear();

class PollOff extends DiscordCommand {
    constructor() {
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
        ];
        super({
            name: 'poloff',
            description: 'Completely turns off pollution. So no new pollution will be generated.',
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
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);
        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }
        //Disable pollution completely.
        let res = await rcon.Send('/sc game.map_settings.pollution.enabled = false'); 
        // this command should not get a reply from the server. The command should print on the ingame server though.
        if (!res) { 
            //Send message to server.
            await rcon.Send(`The server had pollution **DISABLED** by ${interaction.member.displayName}. Please @staff on the discord if this was done by mistake.`);
            //Send message to discord.
            await interaction.editReply(`No Error - Thus pollution should have been **disabled** on S${server}. Command Requested by *${interaction.member.displayName}*.`);
        } else {
            //Send error to discord.
            await interaction.editReply(`Command might have failed result: \`\`\` ${res} \`\`\``);
        } 
    }
}
let poloff = new PollOff();

class Server extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
        */
        let args = [
            {
                type: 'Subcommand',
                command: pause
            },
            {
                type: 'Subcommand',
                command: unpause
            },
            {
                type: 'Subcommand',
                command: speed
            },
            {
                type: 'Subcommand',
                command: polclr
            },
            {
                type: 'Subcommand',
                command: poloff
            },
        ];
        super({
            name: 'server',
            description: 'Factorio server operations.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff
        });
    }
}

let command = new Server();
module.exports = command;