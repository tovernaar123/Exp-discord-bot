//player data storage access

function playerdata1command(name, msg, args) {
    // Find "items" from datastore 
    // get raw data
    let rawdata = fs.readFileSync('/home/exp_admin/api_v2/persistent_storage.json');
    // Take raw data and change it into Json format, to make it simpler to format/lookup
    let mydata = JSON.parse(rawdata);
    // Use the key to look up the player data, for this current data key needs to be the player name to look up.
    // in dataFile
    let key1 = `${name}`; 
    // check data is the parsed data, but only the PlayerData, and that that matches the key1 (name)
    let checkdata = mydata["PlayerData"][key1];
    // Checks to see if any data was retured at all, if the name is not in the database, or the database is not accessable than it will return an error and stop running the command
    
    if (!checkdata) {
        msg.channel.send('Name error: Name not found in datastore. Check the name or try again later.');
        console.log(`Name Not Found`);
        return;
    }

    // if it didnt stop based on the name not returining it will then filter out only the Statistics (removing prefrences like alt mode, join msg etc)
    let finaldata = mydata["PlayerData"][key1]["Statistics"];

    let channel = msg.channel;
    channel.send(`${name}:\n\`\`\`json\n${JSON.stringify(finaldata, null, 2)}\`\`\``);
    return;
}

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
        //board
        let role_needed = "693500936491892826" 
        let role = await msg.guild.roles.fetch(role_needed)
        let allowedThisCommand = msg.member.roles.highest.comparePositionTo(role) >= 0; 
        let name = args[0];

        if (name) {
            if (allowedThisCommand) {
                // If the user is authorized to use the command and supplied a name
                playerdata1command(name, msg, args);
            } else {
                msg.channel.send(`Error: You are not authorized to perform this action.`);
            }
        } else {
            // User doesnt need to get authorized for a self lookup
            name = msg.member.displayName;
            playerdata1command(name, msg, args);
        }
    },
};
