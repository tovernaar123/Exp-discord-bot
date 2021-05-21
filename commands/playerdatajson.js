//player data storage access

module.exports = {
    name: 'playerdatajson',
    aka: ['pd1', 'pdj', 'userdatajson', 'oguserdata','pdjson','pdog'],
    description: 'Get stats (datastore info) for any user (Board+) (No formatting, Json output)',
    guildOnly: true,
    args: true,
    helpLevel: 'board',
    required_role: role.board,
    usage: ` <nameToLookup>`,
    async execute(msg, args, _, internal_error) {
        let name = args[0];
                
        //this command unlike its brother pd2 DOES require a name to be specified. You can still look up yourself but you must add in your username to look up.
        if (!name) {
            msg.channel.send(`Please pick a name first. Just the name - CAPS COUNT (use \`playerdata2\` if you dont want to add in the name`)
                .catch((err) => {internal_error(err); return});
            return;
        }

        if (name) {
            const fs  = require('fs');
            let rawdata = fs.readFileSync('/home/exp_admin/api_v2/persistent_storage.json');
            let mydata = JSON.parse(rawdata);
            // in dataFile
            let key1 = `${name}`;
            let checkdata = mydata["PlayerData"][key1];
            let finaldata;
            
            if (checkdata) {
                finaldata = checkdata["Statistics"];
                msg.channel.send(`${name}:\n\`\`\`json\n${JSON.stringify(finaldata, null, 2)}\`\`\``);
                console.log(`PD of ${name} by ${msg.member.displayName}`)
            } else {
                msg.channel.send('Name error: Name not found in datastore');console.log(`Name Not Found`);
                return;
            }
             
        } else {
            msg.reply(`There was an error with the name that we did not previously catch, please try again later and \`@\` a bot dev`)
                .catch((err) => {internal_error(err); return})
            console.log(`PD Lookup ${msg.author.username} but something unexpected happened, hopefully the log above will tell us what.`);
            return;
        }
    },
};
