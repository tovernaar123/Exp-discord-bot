// @ts-check

require('dotenv').config();
let DiscordCommand = require('./command.js');

//Discord.js imports + init
const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');

/**
 * @typedef {Object} ChildType
 * @property {Discord.Collection} [Commands]
 * @property {RconManager} [Rcons]
 *
 * @typedef {Client & ChildType} Bot
 */

/**
 * @type {Bot} client
 */
const client = new Client({ partials: ['CHANNEL'], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
DiscordCommand.client = client;

//Rcon script
const RconManager = require('./rcon');
const Baseport = 34228;

//Get commands
const commandFiles = require('./file_loader.json');

let config = require('./config');

config.addKey('ServerNotConnected', 'S%s is not connected to the bot.');
config.addKey('ReportChannel', '368812365594230788');
config.addKey('NoResponse', 'There was no response from the server, this is not normal for this command please ask an admin to check the logs.');
config.addKey('SpamChannel', '359442310628376577');

//array for all ofline servers
let OfflineServers = [2, 6, 7, 8];

//standard embed settings like color and footer
let real_discord_embed = Discord.MessageEmbed;

// @ts-ignore
Discord.MessageEmbed = function (data) {
    let discord_embed = new real_discord_embed(data);
    discord_embed.setTimestamp();
    discord_embed.setFooter({ text: client.user.username, iconURL: client.user.avatarURL() });
    discord_embed.setColor('#53380');
    return discord_embed;
};


async function start() {
    let Rcons = new RconManager(OfflineServers, 8, Baseport);
    await Rcons.Connect();
    client.Rcons = Rcons;
    client.login(process.env.DISCORD_TOKEN);
}

start().catch((err) => {
    console.log(err);
});


client.on('ready', async () => {
    let SpamChannel = client.channels.cache.get(config.getKey('SpamChannel'));
    if (SpamChannel.type === 'GUILD_TEXT') {
        SpamChannel.send(`Bot logged in - Notice some Servers are set to be offline (#${OfflineServers}). To enable the bot for them please edit infoBot.js`);
    }
    await client.guilds.cache.get(process.env.guild).commands.set([]);
    //instantiate the list of commands
    client.Commands = new Discord.Collection();

    let waitfor = [];
    for (const file of commandFiles) {
        //require to file so its loaded
        const command = require(`./commands/${file}`);
        //add it to the list 
        client.Commands.set(command.name, command);
        if (command.slash) {
            waitfor.push(command.add_command(client));
        }
    }


    await Promise.all(waitfor);

    let date_string = new Date().toISOString().
        replace(/T/, ' ').      // replace T with a space
        replace(/\..+/, '');     // delete the dot and everything after
    console.log(`${date_string}: I am ready!`);

});

client.on('interactionCreate', async interaction => {

    if (!interaction.isCommand()) return;
    if(!interaction.inCachedGuild()) return;
    const { commandName } = interaction;

    let command = client.Commands.get(commandName);
    if (!command) { await interaction.reply('Command not found'); return; }

    if (command.Subcommands.length > 0) {
        let name = interaction.options.getSubcommand();
        command = command.Subcommands.find((c) => c.name === name);
        await command._execute(interaction);
    } else {
        await command._execute(interaction);
    }


});