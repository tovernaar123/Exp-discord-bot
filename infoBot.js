

require('dotenv').config()
let Discord_Command = require('./command.js');

//Discord.js imports + init
const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({ partials: ["CHANNEL"], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

//Rcon script
const { rcon_connect } = require('./rcon_auto_connect.js');
const baseport = 34228;

//Get commands
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const prefix = `.exp`
let rcons = {};
//global for all commands to use this object
role = {
    staff: "762264452611440653",
    admin: "764526097768644618",
    mod: "762260114186305546",
    board: "765920803006054431"
}


/*prod server
role = {
    staff: "482924291084779532",
    admin: "290940523844468738",
    mod: "260893080968888321",
    board: "693500936491892826",
    sadmin: "446066482007244821"
}
*/


//array for all ofline servers
let offline_servers = [1,2,3,4,5,6,7,8]

//standard embed settings like color and footer
let real_discord_embed = Discord.MessageEmbed
Discord.MessageEmbed = function () {
    let discord_embed = new real_discord_embed()
    discord_embed.setTimestamp()
    discord_embed.setFooter(client.user.username, client.user.avatarURL())
    discord_embed.setColor('53380')
    return discord_embed
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
async function add_slash_commands(commands) {
    //client.application.commands.create();
    /*
    try {
        await rest.put(
            Routes.applicationGuildCommands('731078310079103017', '762249085268656178'),
            { body: [commands] },
        );
    } catch (error) {
        console.error(error);
    }
    */
}


async function start() {
    //await add_slash_commands(Array.from(client.commands.values()))

    //9 cause 8 < 9 and we want to inculde 8 and we start at 1 cuase theirs no s0
    for (let i = 1; i < 9; i++) {
        //if servers is offline dont try and connect to it
        if (offline_servers.includes(i)) {
            rcons[i] = { "connected": false }
            continue;
        }

        //port starts at baseport 34228 and its it server num so s1 is 34229 etc.
        let port_to_use = baseport + i

        //Use the auto rcon connect
        rcon = await rcon_connect(port_to_use, i)

        //add to the list
        rcons[i] = rcon
        Discord_Command.Rcons[i] = rcon;
    }
    //start listing for commands


    client.login(process.env.DISCORD_TOKEN);
}

start().catch((err) => {
    console.log(err)
});


client.on("ready", async () => {
    let date_string = new Date().toISOString().
        replace(/T/, ' ').      // replace T with a space
        replace(/\..+/, '')     // delete the dot and everything after
    console.log(`${date_string}: I am ready!`)
    //client.channels.cache.get('368727884451545089').send(`Bot logged in - Notice some Servers are set to be offline (#${offline_servers}). To enable the bot for them please edit infoBot.js`); // Bot Spam Channel for ready message. Reports channel is "368812365594230788" for exp // Reports Channel is "764881627893334047" for test server
    client.channels.cache.get('764881627893334047').send(`Bot logged in - Notice some Servers are set to be offline (#${offline_servers}). To enable the bot for them please edit infoBot.js`); // Bot Spam Channel for ready message. Reports channel is "368812365594230788" for exp // Reports Channel is "764881627893334047" for test server
    //console.log(year + "-" + month + date + " " + hours + ":" + minutes + ":" + seconds + ": I am ready!");
    
    //void all slash commands
    //await client.guilds.cache.get('762249085268656178').commands.set([])

    //instantiate the list of commands 
    client.commands = new Discord.Collection();
    for (const file of commandFiles) {
        //require to file so its loaded
        const command = require(`./commands/${file}`);
        //add it to the list 
        client.commands.set(command.name, command);
        if(command.slash){
            command.add_command(client);
        }
    }
    console.log('command done');

});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    await client.commands.get(commandName).execute(interaction);


});



client.on("messageCreate", async msg => {

    function internal_error(err) {
        console.log(err)
        msg.channel.send('Internal error in the command. Please contact an admin.')
    }

    //Ends msg early if author is a bot
    const guild = msg.guild;
    if (msg.author.bot) return;

    //Ends msg  code early if the command does not start with a prefix
    if (!msg.content.toLowerCase().startsWith(prefix)) return;

    // remove the .exp then removes the spaces in the beging and end then splits it up into args
    const args = msg.content.slice(prefix.length).trim().split(/ +/g);

    //gets the command in lower case
    const commandName = args.shift().toLowerCase();

    // get the command or its aka
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aka && cmd.aka.includes(commandName));

    // if no command dont do anything
    if (!command) return;

    // disallows commands in dm's to run as commands in dms if it is set to guild only
    if (command.guildOnly && msg.channel.type === 'DM') {
        return msg.reply('Sorry - I can\'t do that in a DM');
    }

    // only runs if below Guild id's (EXP = `260843215836545025`) 762249085268656178 is testing server
    if (command.guildOnly && (guild != `762249085268656178` && guild != `260843215836545025`)) {
        console.log(`Not correct guild`);
        return msg.reply(`Wrong guild`);
    }

    // Check to see if you have the role you need or a higher one
    let req_role = command.required_role

    if (req_role) {
        let role = await msg.guild.roles.fetch(req_role)
        let allowed = msg.member.roles.highest.comparePositionTo(role) >= 0;
        if (!allowed) {
            console.log(`Unauthorized `);
            msg.channel.send(`You do not have ${role.name} permission.`);
            return;
        }

    } else if (command.validator) {
        let obj = await command.validator(msg, args, internal_error)
            .catch((err) => { internal_error(err); return })
        if (!obj.success) {
            return msg.channel.send(obj.error)
                .catch((err) => { internal_error(err); return })
        }
    }


    // If command requires an argument, decline to run if none is provided. Request arguments in the main export of the command file. 
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${msg.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix} ${command.name} ${command.usage}\``;
        }
        return msg.channel.send(reply);
    }

    try {
        command.execute(msg, args, rcons, internal_error)
            .catch((err) => { internal_error(err); return })
    } catch (error) {
        console.log(error);
        msg.reply(`there was an error trying to execute that command!`);
    }

})