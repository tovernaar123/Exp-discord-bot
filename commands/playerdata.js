//player data storage access with new format
//required_role has an exception for the user to look upthemselves, nothing needed here it is handeled in infoBot.js...
//this helpLevel:"all" is required to show up on "semi public commands" it is not needed if the regular command was not restricted to role.board

//make it run
function playerdata2command(name,msg,args)
        {
            //if (1 == 1) 
            //    { // start PHIDAS format feature

                    
                    function ts(x) { //thousands separator
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
                        
                        let msg_4 = [];
                    
                        for (let i = 0; i < layout.length; i++) {
                            let msg_3 = [];
                            
                            if (layout[i] == 'Playtime' || layout[i] == 'AfkTime') {
                                try {
                                    var t1 = msg_2[layout[i]];
                                } catch (e) {
                                    var t1 = 0;
                                }
                                
                                if (isNaN(t1)) {
                                    t1 = 0;
                                }
                                    
                                let h1 = Math.floor(t1 / 60); //the hours part of min-> hh:mm
                                let m1 = Math.floor(t1 % 60); // the min part of hh:mm
                    
                                if (h1 > 0) { // if hours (of hh:mm) is more than 0 then show how many hours you have, else only show mins below
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
                    
                            msg_4.push([msg_3[0], msg_3[1]]); // push title and value in array
                        }
                        
                        return msg_4;
                    }
                    //Find "items" from datastore 
                    const fs  = require('fs');
                        // get raw data
                    let rawdata = fs.readFileSync('/home/exp_admin/api_v2/persistent_storage.json');
                        // Take raw data and change it into Json format, to make it simpler to format/lookup
                    let mydata = JSON.parse(rawdata);
                    //Use the key to look up the player data, for this current data key needs to be the player name to look up.
                    let key1 = `${name}`; // in dataFile
                    //check data is the parsed data, but only the PlayerData, and that that matches the key1 (name)
                    let checkdata = mydata["PlayerData"][key1];
                    let finaldata;
                    //Checks to see if any data was retured at all, if the name is not in the database, or the database is not accessable than it will return an error and stop running the command
                    if(!checkdata)
                        {
                            msg.channel.send('Name error: Name not found in datastore. Check the name or try again later.');console.log(`Name Not Found`); return;
                        }
                    //if it didnt stop based on the name not returining it will then filter out only the Statistics (removing prefrences like alt mode, join msg etc)
                    finaldata = mydata["PlayerData"][key1]["Statistics"];
                    // set item to equal finaldata - to make Phidas formatting as plug and play as possible - not really needed otherwise
                    item = finaldata;

                    let channel = msg.channel;
                    let result = profile(item);
                    let lookup = name;

                    //log and channel (nonembed) messages sent
                    console.log(`Player Data Requested by ${msg.member.displayName}\nUsername: ${lookup} `);
                    channel.send(`\`\`\`txt\nPlayer Data Requested by ${msg.member.displayName}\nUsername: ${lookup}\n\`\`\``);
                    //set up embeds
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

                    //Send the Embeds, sent as 2 because depending on the length discord would error out if you sent them both.
                    channel.send(Embed);
                    channel.send(Embed2);
                    return;

            
            /*
            } 
            *else 
            *{
            *    msg.reply(`Something went wrong. See the logs because you should never run into this on this command`)
            *        .catch((err) => { internal_error(err); return })
            *    console.log(`player data lookup by ${msg.author.username} but something happened, we dont know what, look at the logs that were just posted above.`);
            *    return;
            }
            */
}



module.exports = {
    name: 'playerdata',
    aka: ['userdata2','pd','pdformatted','pdnice','playerdataformatted','userdata'],
    description: 'Get stats (datastore info) for youself (all users) or any users (Board+)',
    guildOnly: true,
    args: false,
    helpLevel: "all",
    required_role: role.board,
    usage: ` <name>`,
    execute(msg, args, _, internal_error) {
        const Discord = require('discord.js');
        let name = args[0];
                
        //runs the command if the person supplied a name
        if(name){playerdata2command(name,msg,args)}
        //runs the command after setting the name to look up as the user who submitted the request
        if(!name){name = msg.member.displayName; playerdata2command(name,msg,args)}
        
         
        
       
    },
};
