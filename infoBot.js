require('dotenv').config();
const fs = require('fs');
const {rcon_connect} = require('./rcon_auto_connect.js');
const Discord = require('discord.js');
const {Client, Intents} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
let rcons = {};
const baseport = 34228;
const prefix = `.exp`

if (typeof process.env.RUN === 'string') {
    if (process.env.RUN.toLowerCase() == 'dev') {
        // Development
        role = {
            board: "765920803006054431",
            staff: "762264452611440653",
            mod: "762260114186305546",
            admin: "764526097768644618"
        };
    }
} else {
    // Production
    role = {
        board: "693500936491892826",
        staff: "482924291084779532",
        mod: "260893080968888321",
        admin: "290940523844468738",
        sadmin: "446066482007244821"
    };
}

//array for all ofline servers
let offline_servers = [2, 6, 7, 8];

// Standard embed settings like color and footer
/*
let real_discord_embed = Discord.MessageEmbed;
Discord.MessageEmbed = function () {
    let discord_embed = new real_discord_embed();
    discord_embed.setTimestamp();
    discord_embed.setFooter(client.user.username, client.user.avatarURL());
    discord_embed.setColor('53380');
    return discord_embed;
}
*/

async function start() {
    //instantiate the list of commands 
    client.commands = new Discord.Collection();
    for (const file of commandFiles) {
        //require to file so its loaded
        const command = require(`./commands/${file}`);
        //add it to the list 
        client.commands.set(command.name, command);
    }

    //9 cause 8 < 9 and we want to inculde 8 and we start at 1 cuase theirs no s0
    for (let i = 1; i < 9; i++) {
        //if servers is offline dont try and connect to it
        if (offline_servers.includes(i)) {
            rcons[i] = {"connected": false};
            continue;
        }

        //port starts at baseport 34228 and its it server num so s1 is 34229 etc.
        let port_to_use = baseport + i;

        //Use the auto rcon connect
        rcon = await rcon_connect(port_to_use, i);

        //add to the list
        rcons[i] = rcon;
    }

    //start listing for commands
    client.login(process.env.DISCORD_TOKEN);
}

start().catch((err) => {console.log(err)});

client.on("ready", () => {
    // replace T with a space
    // delete the dot and everything after
    let date_string = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    console.log(`${date_string}: Bot is ready.`);

    // Bot ready message. 
    // exp "368812365594230788"
    // dev "764881627893334047"

    if (typeof process.env.RUN === 'string') {
        if (process.env.RUN.toLowerCase() == 'dev') {
            client.channels.cache.get('764881627893334047').send(`Bot is ready.`);
        }
    } else {
        client.channels.cache.get('368727884451545089').send(`Bot is ready.`);
    }
});

client.on("messageCreate", async msg => {
    const guild = msg.guild;

    function internal_error(err) {
        console.log('Error: ');
        console.log(err);
        msg.channel.send({content: 'Internal error has occurred.'});
    }

    // Ends message if author is bot
    if (msg.author.bot) {
        return;
    }

    // Ends message if it dont start with prefix
    if (!msg.content.toLowerCase().startsWith(prefix)) {
        return;
    }

    // remove the .exp then removes the spaces in the beging and end then splits it up into args
    const args = msg.content.slice(prefix.length).trim().split(/ +/g);

    // get the command in lower case
    const commandName = args.shift().toLowerCase();

    // get the command or its aka
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aka && cmd.aka.includes(commandName));

    // if no command dont do anything
    if (!command) {
        return;
    }

    // disallows commands in dm's to run as commands in dms if it is set to guild only
    if (command.guildOnly && msg.channel.type !== 'text') {
        return msg.reply({content: 'Direct Message is not allowed.'});
    }

    // Prod and Dev Server
    if (command.guildOnly && (guild != `260843215836545025` && guild != `762249085268656178`)) {
        console.log(`Info: Other guild.`);
        return msg.reply({content: `The bot cannot run in other guild.`});
    }

    // Check to see if you have the role you need or a higher one
    let req_role = command.required_role

    if (req_role) {
        let role = await msg.guild.roles.fetch(req_role);
        let allowed = msg.member.roles.highest.comparePositionTo(role) >= 0;

        if (!allowed) {
            console.log(`Info: User is not authorized to use the command.`);
            msg.channel.send({content: `You do not have ${role.name} or above permission to run the command.`});
            return;
            }
        };

    // If command requires an argument, decline to run if none is provided. Request arguments in the main export of the command file. 
    if (command.args && !args.length) {
        let reply = `You didn't provide enough arguments, ${msg.author.displayName}.`;

        if (command.usage) {
            reply += `\nCorrect usage: \`${prefix} ${command.name} ${command.usage}\``;
        }

        return msg.channel.send({content: reply});
    }

    try {
        command.execute(msg, args, rcons, internal_error).catch((err) => {internal_error(err); return});
    } catch (error) {
        console.log(error);
        msg.reply({content: `An error has occurred when executing the command.`});
    }
})