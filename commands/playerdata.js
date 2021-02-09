//player data storage access




module.exports = {
    name: 'playerdata',
    aka: ['pd', 'userdata'],
    description: 'get chat (last 10 lines) (Board+ command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.board,
    usage: ` <name>`,
    execute(msg, args, _, internal_error) {
        let name = args[0];
        
        if (!name) {
            msg.channel.send('Please pick a name first. Just the name - CAPS COUNT')
                .catch((err) => { internal_error(err); return });
            return;
        }
         if (name) 
         {
              const fs  = require('fs');
              let rawdata = fs.readFileSync('/home/exp_admin/api_v2/persistent_storage.json');
              let mydata = JSON.parse(rawdata);
              key1 = `${name}`; // in dataFile
              key2 = `Statistics`;
              //console.log(mydata[rawdata][PlayerData][key1][Statistics]);
              console.log(mydata["PlayerData"][key1]["Statistics"])
             .catch((err) = > { internal_error(err); msg.channel.send(`Name not valid.`); return )}
              
        } else {
            msg.reply(`Please pick a server first. Just the number (currently 1-8). Correct usage is \` .exp unjail <server#> <username>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`log look up by ${msg.author.username} incorrect server number`);
            return;
        }

    },
};
