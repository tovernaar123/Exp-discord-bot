//player data storage access with new format
//required_role has an exception for the user to look upthemselves, nothing needed here it is handeled in infoBot.js...
module.exports = {
    name: 'playerdata2',
    aka: ['pd2', 'userdata2'],
    description: 'get datastore info from (Board+ command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.board,
    usage: ` <name>`,
    execute(msg, args, _, internal_error) {
        const Discord = require('discord.js');
        let name;
        name = msg.member.displayName;
        name = args[0];
        

        
        
       // if (!name) {
       //     msg.channel.send('Please pick a name first. Just the name - CAPS COUNT')
       //         .catch((err) => { internal_error(err); return });
       //     return;
       // }
        if (1 == 1) 
        { // start PHIDAS format feature

            function ts(x) {
                if (x === undefined) {
                    return 0;
                } else {
                    try {
                        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    } catch(e) {
                        return 0;
                    }
                }
            }
            
            function profile(msg_2) {
                var layout = ['Playtime', 'AfkTime', 'MapsPlayed', 'JoinCount', 'ChatMessages', 'CommandsUsed', 'RocketsLaunched', 'ResearchCompleted', 'MachinesBuilt', 'MachinesRemoved', 'TilesBuilt', 'TilesRemoved', 'TreesDestroyed', 'OreMined', 'ItemsCrafted', 'ItemsPickedUp', 'Kills', 'Deaths', 'DamageDealt', 'DistanceTravelled', 'CapsulesUsed', 'EntityRepaired', 'DeconstructionPlannerUsed', 'MapTagsMade'];
                var layout_dict = {
                    'Playtime':'Play Time',
                    'AfkTime':'AFK Time',
                    'MapsPlayed':'Maps Played',
                    'JoinCount':'Join Count',
                    'ChatMessages':'Chat Messages',
                    'CommandsUsed':'Commands',
                    'RocketsLaunched':'Rockets Launched',
                    'ResearchCompleted':'Research Completed',
                    'MachinesBuilt':'Machines Built',
                    'MachinesRemoved':'Machines Removed',
                    'TilesBuilt':'Tiles Placed',
                    'TilesRemoved':'Tiles Removed',
                    'TreesDestroyed':'Trees Destroyed',
                    'OreMined':'Ore Mined',
                    'ItemsCrafted':'Items Crafted',
                    'ItemsPickedUp':'Items Picked Up',
                    'Kills':'Kills',
                    'Deaths':'Deaths',
                    'DamageDealt':'Damage Dealt',
                    'DistanceTravelled':'Distance Travelled',
                    'CapsulesUsed':'Capsules Used',
                    'EntityRepaired':'Machines Repaired',
                    'DeconstructionPlannerUsed':'Decon Planner Used',
                    'MapTagsMade':'Map Tags Created'
                };
                
                var msg_4 = [];
            
                for (let i = 0; i < layout.length; i++) {
                    var msg_3 = [];
                    
                    if (layout[i] == 'Playtime' || layout[i] == 'AfkTime') {
                        try {
                            var t1 = msg_2[layout[i]];
                        } catch (e) {
                            var t1 = 0;
                        }
                            
                        var h1 = Math.floor(t1 / 60);
                        var m1 = Math.floor(t1 % 60);
            
                        if (h1 > 0) {
                            msg_3.push(layout_dict[layout[i]]);
                            msg_3.push(h1 + ' h ' + m1 + ' m');
                        } else {
                            msg_3.push(layout_dict[layout[i]]);
                            msg_3.push(m1 + ' m ');
                        }
            
                    } else {
                        try {
                            msg_3.push(layout_dict[layout[i]]);
                            msg_3.push(ts(msg_2[layout[i]]));
                        } catch (e) {
                            msg_3.push(layout_dict[layout[i]]);
                            msg_3.push(ts(0));
                        }
                    }
            
                    msg_4.push([msg_3[0], msg_3[1]]);
                }
                
                return msg_4;
            }
            //find items
            const fs  = require('fs');
             let rawdata = fs.readFileSync('/home/exp_admin/api_v2/persistent_storage.json');
             let mydata = JSON.parse(rawdata);
              key1 = `${name}`; // in dataFile
              key2 = `Statistics`;
              let checkdata = mydata["PlayerData"][key1];
              let finaldata;
              if(!checkdata)
              {msg.channel.send('Name error: Name not found in datastore');console.log(`Name Not Found`); return;}
              
              finaldata = mydata["PlayerData"][key1]["Statistics"];
              item = finaldata;


            let channel = msg.channel;
            let author = msg.author.username;
            let result = profile(item);
            let lookup = key1;

            channel.send(`\`\`\`Player Data\nRequested by ${msg.member.displayName}\nUsername: ${lookup}\n\`\`\``);

            const Embed = new Discord.MessageEmbed();
            Embed.setColor("0x00ff00");

            for (let i = 0; i < result.length/2; i+=2) {
                try {
                    Embed.addField(result[i][0], result[i][1], true);
                } catch (e) {
                    Embed.addField(`** **`, `** **`, true);
                }

                try {
                    Embed.addField(result[i+1][0], result[i+1][1], true);
                } catch (e) {
                    Embed.addField(`** **`, `** **`, true);
                }

                Embed.addField(`** **`, `** **`, true);
            }

            const Embed2 = new Discord.MessageEmbed();
            Embed2.setColor("0x00ff00");

            for (let i = 0; i < result.length/2; i+=2) {
                let j = i + result.length/2;
                try {
                    Embed2.addField(result[j][0], result[j][1], true);
                } catch (e) {
                    Embed2.addField(`** **`, `** **`, true);
                }

                try {
                    Embed2.addField(result[j+1][0], result[j+1][1], true);
                } catch (e) {
                    Embed2.addField(`** **`, `** **`, true);
                }
                
                Embed2.addField(`** **`, `** **`, true);
            }

            channel.send(Embed);
            channel.send(Embed2);
            channel.send();
            return;











































































            /*
              const fs  = require('fs');
             let rawdata = fs.readFileSync('/home/exp_admin/api_v2/persistent_storage.json');
             let mydata = JSON.parse(rawdata);
              key1 = `${name}`; // in dataFile
              key2 = `Statistics`;
              let checkdata = mydata["PlayerData"][key1];
              let finaldata;
              if(mydata["PlayerData"][key1] )
              {
                finaldata = mydata["PlayerData"][key1]["Statistics"];
                            
                msg.channel.send(`${name}:\n\`\`\`json\n${JSON.stringify(finaldata, null, 2)}\`\`\``);
              }
             else{msg.channel.send('Name error: Name not found in datastore');console.log(`Name Not Found`); return;}
             */
        
        } else {
            msg.reply(`Please pick a server first. Just the number (currently 1-8). Correct usage is \` .exp unjail <server#> <username>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`log look up by ${msg.author.username} incorrect server number`);
            return;
        }

    },
};
