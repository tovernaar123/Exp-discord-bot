const Discord = require('discord.js');
const fs  = require('fs');
const puppeteer = require('puppeteer');

function playerdata3command(name, msg) {
    //thousands separator
    function ts(x, nd) {
        // x as value
        // nd as nth decimal places
        nd = nd || 0;
    
        if (x === undefined) {
            return 0;
        } else {
            let i = Math.round(Number(x) * 100) / 100;
            var d = i.toFixed(nd).split(".");
            try {
                return d[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (d[1] ? "." + d[1] : "");
            } catch(e) {
                return 0;
            }
        }
    }
                    
    function profile(msg_2) {
        var layout = ['Playtime', 'AfkTime', 'MapsPlayed', 'JoinCount', 'ChatMessages', 'CommandsUsed', 'RocketsLaunched', 'ResearchCompleted', 'MachinesBuilt', 'MachinesRemoved', 'TilesBuilt', 'TilesRemoved', 'TreesDestroyed', 'OreMined', 'ItemsCrafted', 'ItemsPickedUp', 'Kills', 'Deaths', 'DamageDealt', 'DistanceTravelled', 'CapsulesUsed', 'EntityRepaired', 'DeconstructionPlannerUsed', 'MapTagsMade'];
        var layout_dict = {
            // 0
            'Playtime':'Play Time',
            'AfkTime':'AFK Time',
            'MapsPlayed':'Maps Played',
            'JoinCount':'Join Count',
            'ChatMessages':'Chat Messages',
            // 5
            'CommandsUsed':'Commands',
            'RocketsLaunched':'Rockets Launched',
            'ResearchCompleted':'Research Completed',
            'MachinesBuilt':'Machines Built',
            'MachinesRemoved':'Machines Removed',
            // 10
            'TilesBuilt':'Tiles Placed',
            'TilesRemoved':'Tiles Removed',
            'TreesDestroyed':'Trees Destroyed',
            'OreMined':'Ore Mined',
            'ItemsCrafted':'Items Crafted',
            // 15
            'ItemsPickedUp':'Items Picked Up',
            'Kills':'Kills',
            'Deaths':'Deaths',
            'DamageDealt':'Damage Dealt',
            'DistanceTravelled':'Distance Travelled',
            // 20
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
                
                if (isNaN(t1)) {
                    t1 = 0;
                }
    
                var h1 = Math.floor(t1 / 60);
                var m1 = Math.floor(t1 % 60);
    
                if (h1 > 0) {
                    msg_3.push(layout_dict[layout[i]]);
                    msg_3.push(ts(h1, 0) + ' h ' + m1 + ' m');
                } else {
                    msg_3.push(layout_dict[layout[i]]);
                    msg_3.push(m1 + ' m ');
                }
    
            } else {
                try {
                    msg_3.push(layout_dict[layout[i]]);
                    msg_3.push(ts(msg_2[layout[i]], 0));
                } catch (e) {
                    msg_3.push(layout_dict[layout[i]]);
                    msg_3.push(ts(0, 0));
                }
            }
            msg_4.push([msg_3[0], msg_3[1]]);
        }
        
        // Additional Data
        msg_4.push(['AFK Time Ratio', ts(msg_2[layout[1]] / msg_2[layout[0]] * 100, 2) + ' %']);
        msg_4.push(['Chat Command Ratio', ts(msg_2[layout[5]] / msg_2[layout[4]] * 100, 2) + ' %']);
        msg_4.push(['Build Ratio', ts(msg_2[layout[8]] / msg_2[layout[9]], 2)]);
        msg_4.push(['Tiles Build Ratio', ts(msg_2[layout[10]] / msg_2[layout[11]], 2)]);
        msg_4.push(['Kill Death Ratio', ts(msg_2[layout[16]] / msg_2[layout[17]], 2)]);
        msg_4.push(['Damage Death Ratio', ts(msg_2[layout[18]] / msg_2[layout[17]], 2)]);
        return msg_4;
    }
                    
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
        msg.channel.send('Error: Name not found. Check the name or try again later.');
        console.log(`Name not found`);
        return;
    }

    // if it didnt stop based on the name not returining it will then filter out only the Statistics (removing prefrences like alt mode, join msg etc)
    let finaldata = mydata["PlayerData"][key1]["Statistics"];
    
    let channel = msg.channel;
    let result = profile(finaldata);
    let lookup = name;

    // Background Color
    let html_background_color = '#4F4F4F';
    // Font Color
    let html_font_color = '#F0F0F0';
    // Table Border Color
    let html_table_border_color = '#6F6F6F';
    // Font Family
    // Arial, Helvetica, Verdana, Calibri
    let html_font_family = 'Helvetica';
    // Font Size
    let html_font_size = '1em';
    // Table Individual Width
    let html_table_width = [200, 140];
    // Table Total Width
    let html_table_width_total = 2 * (html_table_width[0] + html_table_width[1]);
    // Total Browser Height
    let html_body_height = 565;

    // font-weight:bold
    let html_code = ['<html>\n<head>\n<title></title>\n</head>\n<body style="background-color:' + html_background_color + '"><hr style="height:5px; visibility:hidden;margin:0px;border:0px;">',
    '<h2 style="width:100%;text-align:center;border-bottom:1px solid ' + html_table_border_color + ';line-height:0.1em;margin:10px 0 20px;color:' + html_font_color + '"><span style="background-color:' + html_background_color + ';padding:0 10px;font-family:' + html_font_family + ';">Data</span></h2>',
    '<p style="font-family:' + html_font_family + ';font-size:' + html_font_size + ';color:' + html_font_color + '">Player data requested by: ' + author + ' </p>',
    '<p style="font-family:' + html_font_family + ';font-size:' + html_font_size + ';color:' + html_font_color + '">Username: ' + lookup + ' </p>',
    '<table style="border-collapse:collapse;width=' + html_table_width_total + 'px;">']

    let result = profile(item);
    let table_td_style = '<td style="padding:5px;border:1px solid ' + html_table_border_color + ';font-family:' + html_font_family + ';font-size:' + html_font_size + ';text-align:left;color:' + html_font_color + ';'
    let table_td_width = ['width:' + html_table_width[0] + 'px;">', 'width:' + html_table_width[1] + 'px;">'];

    // Table Contents
    for (let i = 0; i < result.length; i+=2) {
        let html_table = [];

        html_table.push('<tr>\n' + table_td_style + table_td_width[0]);
        html_table.push(result[i][0]);
        html_table.push('</td>\n' + table_td_style + table_td_width[1]);
        html_table.push(result[i][1]);
        html_table.push('</td>\n' + table_td_style + table_td_width[0]);
        html_table.push(result[i+1][0]);
        html_table.push('</td>\n' + table_td_style + table_td_width[1]);
        html_table.push(result[i+1][1]);
        html_table.push('</td>\n</tr>');
            
        html_code.push(j.join(''));
    }

    html_code.push('</table>\n</body>\n</html>');
    
    try {
        (async () => {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            await page.setViewport({
                width: html_table_width_total,
                height: html_body_height,
                deviceScaleFactor: 1,
                });
            // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
            await page.setContent(html_code.join('\n'))
            await page.screenshot({path: './graph.png'})
            await browser.close()
            })()
    } catch (e) {
        channel.send('Error when creating image.');
    }

    // channel.send(`\`\`\`Player Data Requested by ${message.author.username}\nUsername: ${lookup}\n\`\`\``);
    channel.send({files: ['./graph.png']})
    return;
}


module.exports = {
    name: 'playerdatapic',
    aka: ['pd3','pdp'],
    description: 'Get stats (datastore info) for youself (all users) or any users (Board+)',
    guildOnly: true,
    args: false,
    helpLevel: "all",
    usage: ` <name>`,
    async execute(msg, args, _, internal_error) {
        async function runCommand() {
            //board
            let role_needed = role.board;
            let role = await msg.guild.roles.fetch(role_needed);
            let allowedThisCommand = msg.member.roles.highest.comparePositionTo(role) >= 0; 
            let name = args[0];
            
            if (name) {
                if (allowedThisCommand) {
                    // If the user is authorized to use the command and supplied a name
                    playerdata3command(name, msg);
                } else {
                    msg.channel.send(`Error: You are not authorized to perform this action.`);
                }
            } else {
                // User doesnt need to get authorized for a self lookup
                name = msg.member.displayName;
                playerdata3command(name, msg);
            }
        }
        runCommand();
    },
};
