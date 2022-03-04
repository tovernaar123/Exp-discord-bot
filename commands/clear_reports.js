let Discord_Command = require('../command.js');


async function runCommand(server, rcon, interaction, toClear, reason) {
    if(!rcon.connected){
        await interaction.editReply(`S${server} is not connected the bot.`);
        return;
    }
    if(toClear.match(/\\|"|'/)){
        return await interaction.editReply('You cannot use " , \\ or \' in the name of the player.');
    }
    if(interaction.member.displayName.match(/\\|"|'/)){
        return await interaction.editReply('You cannot use " , \\ or \' in your username.');
    }
    let res = await rcon.send(`/interface require("modules.control.reports").remove_all("${toClear}", "${interaction.member.displayName}")`);
    

    await interaction.editReply(`*Please make sure you have the correct username and a report was issued in #reports.* Server replies complete even if user does not exist. Server replied: ${res} By: ${interaction.user.username} becasue: *${reason}*`);
}

/*
module.exports = {
    name: 'clear-reports',
    aka: ['clearreports','cr','clear_reports','clear-report'],
    description: 'Clear reports on ingame users (Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'role.staff',
    required_role: role.staff,
    usage: ' <username> <reason>',
    async execute(msg, args, rcons, internal_error) {
        const author = msg.author.displayName; //find author
        const server = Math.floor(Number(args[0]));

        let reason = args.slice(2).join(' ');
        let toClear = args[1];

        if (!server) { // Checks to see if the person specified a server number
            msg.channel.send('Please pick a server first (**just the number 1-8**). \`<Server#> <username> <reason>\`')
                .catch((err) => { internal_error(err); return; });
            console.log('Clear Reports- Did not have server number');
            return;
        }
        if (!toClear) { // if no 2nd argument returns without running with error
            msg.channel.send('You need to tell us who you would like to clear for us to be able to clear-all `<#> <username> <reason>`')
                .catch((err) => { internal_error(err); return; });
            console.log('Clear Reports - Did not have name');
            return;
        }
        if (!reason) { // if no other arguments (after 2nd ) than returns without running with notice to provide a reason
            msg.channel.send('Please put a reason for the report chan. `<#> <username> <reason>`')
                .catch((err) => { internal_error(err); return; });
            console.log('Clear Reports -Did not have reason');
            return;
        }
        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            runCommand(server, rcons[server], msg, toClear, reason)
                .catch((err) => { internal_error(err); return; });
        } else {
            // If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
            msg.reply('Please pick a server first (**just the number 1-8**). Correct usage is `.exp clear-all <server#> <reason>`')
                .catch((err) => { internal_error(err); return; });
            console.log(`players online by ${author} incorrect server number`);
        }
    },
};
*/

class clear_reports extends Discord_Command {
    constructor() {
        let args = [
            Discord_Command.common_args.server,
            {
                name: 'player',
                description: 'The name of the player you would like to clear reports for.',
                required: true,
                type: 'String'
            }
        ];
        super({
            name: 'clear_reports',
            description: 'Will clear the reports of a player.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            required_role: Discord_Command.roles.staff,
        });

    }
    async execute(interaction) 
    {
        await interaction.deferReply();
        let server = interaction.options.getString('server');
        await runCommand(server, Discord_Command.Rcons[server], interaction, interaction.options.getString('player'), interaction.options.getString('reason'));
    }

}

let clear_report = new clear_reports();
module.exports = clear_report;