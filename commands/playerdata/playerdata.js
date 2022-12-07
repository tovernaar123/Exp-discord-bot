// @ts-check
let Eta = require('eta');
let DiscordCommand = require('./../../command.js');
const fs = require('fs');
const puppeteer = require('puppeteer');
let config = require('./../../config');

config.addKey('Playerdata/Dir');
config.addKey('Playerdata/NameNotFound', 'Error: Name not found. Check the name or try again later.');
config.addKey('Playerdata/Privacy', 'Error: Privacy Settings Prevent Lookup. Check the name or try again later after turning on Data sync.');
config.addKey('Playerdata/NotAuthorized', 'You need board for the this command (or you need to use your own name).');

function ts(n, nd) {
    // n as value
    // nd as nth decimal places
    const nf = new Intl.NumberFormat('ja-JP');
    nd = nd || 0;

    if (n === undefined || isNaN(n)) {
        n = 0;
    }
    
    return nf.format(Number(n.toFixed(nd)));
}

function hhmm(n) {
    if (Math.floor(n / 60) > 0) {
        return Math.floor(n / 60) + ' h ' + Math.floor(n % 60) + ' m'
    } else {
        return Math.floor(n % 60) + ' m'
    }
}

function pc_chg(a, b) {
    if (a == undefined || b == undefined) {
        return '-';
    }

    let chg = (b - a) / a;
    let sym = '';

    if (chg >= 0) {
        sym = '+ ';
    } else {
        sym = '- ';
    }
    
    const clen = Math.ceil(Math.log10(Math.abs(chg) + 1));

    if (clen < 2) {
        return sym + ts(Math.abs(chg * 100), 2) + ' %';
    } else if (clen < 5) {
        return sym + ts(Math.abs(chg), 2) + ' X';
    } else if (clen < 8) {
        return sym + ts(Math.abs(chg / Math.pow(10, 3)), 2) + ' K';
    } else if (clen < 11) {
        return sym + ts(Math.abs(chg / Math.pow(10, 6)), 2) + ' M';
    } else if (clen < 14) {
        return sym + ts(Math.abs(chg / Math.pow(10, 9)), 2) + ' G';
    } else if (clen < 17) {
        return sym + ts(Math.abs(chg / Math.pow(10, 12)), 2) + ' T';
    } else if (clen < 20) {
        return sym + ts(Math.abs(chg / Math.pow(10, 15)), 2) + ' P';
    }
}

function profile_data_comp(data) {
    let layout = ['Playtime', 'AfkTime', 'MapsPlayed', 'JoinCount', 'ChatMessages', 'CommandsUsed', 'RocketsLaunched', 'ResearchCompleted', 'MachinesBuilt', 'MachinesRemoved', 'TilesBuilt', 'TilesRemoved', 'TreesDestroyed', 'OreMined', 'ItemsCrafted', 'ItemsPickedUp', 'Kills', 'Deaths', 'DamageDealt', 'DistanceTravelled', 'CapsulesUsed', 'EntityRepaired', 'DeconstructionPlannerUsed', 'MapTagsMade'];
    let layout_dict = {
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
    let layout_e = [['AFK Time Ratio (%)', 1, 'AfkTime', 'Playtime', 100], ['Session Length', 3, 'Playtime', 'JoinCount', 1], ['Map Join Ratio', 1, 'JoinCount', 'MapsPlayed', 1], ['Rocket Per Hour', 1, 'RocketsLaunched', 'Playtime', 60], ['Kill Death Ratio', 1, 'Kills', 'Deaths', 1], ['Damage Death Ratio', 1, 'DamageDealt', 'Deaths', 1]]
    var msg_5 = [];

    for (let i = 0; i < layout.length; i++) {
        if (data[layout[i]] === undefined) {
            data[layout[i]] = 0
        }

        let msg_4 = [];
        msg_4.push(layout_dict[layout[i]]);

        if (layout[i] == 'Playtime' || layout[i] == 'AfkTime') {
            let t1 = [data[0][layout[i]], data[1][layout[i]]];
            
            for (let k = 0; k < 2; k++) {
                msg_4.push(hhmm(t1[k]));
            }

            msg_4.push(pc_chg(t1[0], t1[1]));
        } else {
            let n1 = data[0][layout[i]];
            let n2 = data[1][layout[i]];
            msg_4.push(ts(n1, 0));
            msg_4.push(ts(n2, 0));
            msg_4.push(pc_chg(n1, n2));
        }

        msg_5.push([msg_4[0], msg_4[1], msg_4[2], msg_4[3]]);
    }
    
    // Additional Data
    for (let i = 0; i < layout_e.length; i++) {
        let msg_4 = [];
        let n1 = 0;
        let n2 = 0;
        msg_4.push(layout_e[i][0]);

        if (layout_e[i][1] == 1) {
            n1 = data[0][layout_e[i][2]] / data[0][layout_e[i][3]] * layout_e[i][4]
            n2 = data[1][layout_e[i][2]] / data[1][layout_e[i][3]] * layout_e[i][4]
            msg_4.push(ts(n1, 2))
            msg_4.push(ts(n2, 2))
            msg_4.push(pc_chg(n1, n2))
        } else if (layout_e[i][1] == 2) {
            n1 = data[0][layout_e[i][2]] / data[0][layout_e[i][3]] / layout_e[i][4]
            n2 = data[1][layout_e[i][2]] / data[1][layout_e[i][3]] / layout_e[i][4]
            msg_4.push(ts(n1, 2))
            msg_4.push(ts(n2, 2))
            msg_4.push(pc_chg(n1, n2))
        } else if (layout_e[i][1] == 3) {
            let t1 = [Math.floor(data[0][layout_e[i][2]] / data[0][layout_e[i][3]]), Math.floor(data[1][layout_e[i][2]] / data[1][layout_e[i][3]])];

            for (let k = 0; k < 2; k++) {
                msg_4.push(hhmm(t1[k]));
            }

            msg_4.push(pc_chg(t1[0], t1[1]));
        }

        msg_5.push([msg_4[0], msg_4[1], msg_4[2], msg_4[3]]);
    }

    return msg_5;
}

//Formats the numbers to be displayed in the grid (So that they have comma's every 3 digits).
const nf = new Intl.NumberFormat('en-US');

/**
 * @typedef {object} Stats
 * @property {Number} JoinCount
 * @property {Number} MapsPlayed
 * @property {Number} DistanceTravelled
 * @property {Number} Playtime
 * @property {Number} ItemsPickedUp
 * @property {Number} ItemsCrafted
 * @property {Number} MachinesBuilt
 * @property {Number} MachinesRemoved
 * @property {Number} ResearchCompleted
 * @property {Number} ChatMessages
 * @property {Number} TreesDestroyed
 * @property {Number} CapsulesUsed
 * @property {Number} DeconstructionPlannerUsed
 * @property {Number} DamageDealt
 * @property {Number} Kills
 * @property {Number} Deaths
 * @property {Number} EntityRepaired
 * @property {Number} CommandsUsed
 * @property {Number} AfkTime
 * @property {Number} TilesRemoved
 * @property {Number} TilesBuilt
 * @property {Number} MapTagsMade
 * @property {Number} RocketsLaunched
 * @property {Number} OreMined
*/


/**
 * @type {{[key: string]: string | function(Partial<Stats>): string}}
*/
let layout = {
    // 0
    'Play time': (stats) => {
        let time = stats.Playtime || 0;
        let hours = Math.floor(time/ 60) || 0;
        let minutes = time % 60;
        return `${hours} h ${minutes} m`;
    },
    'AFK time': (stats) => {
        let time = stats.AfkTime || 0;
        let hours = Math.floor(time/ 60);
        let minutes = time % 60;
        return `${hours} h ${minutes} m`;
    },

    'Maps played': 'MapsPlayed',
    'Join count': 'JoinCount',
    'Chat messages': 'ChatMessages',
    // 5
    'Commands used': 'CommandsUsed',
    'Rockets launched': 'RocketsLaunched',
    'Research completed': 'ResearchCompleted',
    'Machines built': 'MachinesBuilt',
    'Machines removed': 'MachinesRemoved',
    // 10
    'Tiles placed': 'TilesBuilt',
    'Tiles removed': 'TilesRemoved',
    'Trees destroyed': 'TreesDestroyed',
    'Ore mined': 'OreMined',
    'Items crafted': 'ItemsCrafted',
    // 15
    'Items picked up': 'ItemsPickedUp',
    'Kills': 'Kills',
    'Deaths': 'Deaths',
    'Damage dealt': 'DamageDealt',
    'Distance travelled': 'DistanceTravelled',
    // 20
    'Capsules used': 'CapsulesUsed',
    'Machines repaired': 'EntityRepaired',
    'Decon planner used': 'DeconstructionPlannerUsed',
    'Map tags made': 'MapTagsMade',

    'Damage Death ratio': (stats) => {
        let damage = stats.DamageDealt || 0;
        let deaths = stats.Deaths || 0;
        let rounded = (damage / deaths).toFixed(2);
        return nf.format(Number(rounded));
    },
    'Kill Death Ratio': (stats) => {
        let kills = stats.Kills || 0;
        let deaths = stats.Deaths || 0;
        let rounded = (kills / deaths).toFixed(2);
        return nf.format(Number(rounded));
    },
    'Average Session time': (stats) => {
        return (stats.Playtime / stats.JoinCount).toFixed(2);
    },
    'Build to remove ratio': (stats) => {
        return (stats.MachinesBuilt / stats.MachinesRemoved).toFixed(2);
    },
    'Rockets per hour': (stats) => {
        return (stats.RocketsLaunched / (stats.Playtime / 60)).toFixed(2);
    },
    'TKPM (Tree kills per min)': (stats) => {
        return (stats.TreesDestroyed / (stats.Playtime)).toFixed(2);
    },
    'Net Play Time': (stats) => {
        let hours = Math.floor((stats.Playtime - stats.AfkTime) / 60);
        let minutes = stats.Playtime % 60;
        return `${hours} h ${minutes} m`;
    },
    'AFK Time ratio (%)': (stats) => {
        return `${(stats.AfkTime / stats.Playtime * 100).toFixed(2)}%`;
    },

};
/**
 * 
 * @param {String} name 
 * @returns {{error: string | false, stats?: Stats}}
 */
function player_data(name) {
    //Read the player data file.
    let rawdata = fs.readFileSync(config.getKey('Playerdata/Dir')); ///mnt/c/programming/tools/factorio_servers/playerdata.json'
    //Take raw data and change it into Json format, to make it simpler to format/lookup
    let DataStore = JSON.parse(rawdata.toString());

    //Get the Data of the Player.
    let PlayerData = DataStore['PlayerData'][name];
    //Checks to see if any data was retured at all, if the name is not in the database, or the database is not accessable than it will return an error and stop running the command

    if (!PlayerData) {
        return { error: config.getKey('Playerdata/NameNotFound') };
    }

    //Get the boolean to check if the player has agreed to the privacy policy.
    let privacyData = PlayerData['DataSavingPreference'];
    if (privacyData) {
        return { error: config.getKey('Playerdata/Privacy') };
    }
    //if it didnt stop based on the name not returining it will then filter out only the Statistics (removing prefrences like alt mode, join msg etc).
    return { error: false, stats: PlayerData['Statistics'] };
}

/**
* @class
* @augments DiscordCommand
*/
class Picture extends DiscordCommand {

    constructor() {
        /**
         * @type {import("./../../command.js").Argument[]}
        */
        let args = [
            {
                name: 'name',
                description: 'The name of the player to lookup.',
                required: true,
                type: 'String',
            },
        ];
        super({
            name: 'picture',
            description: 'Returns a foto of the player\'s data',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.board
        });
    }
    
    /**
     * @type {import("./../../command.js").Authorize}
    */
    async authorize(interaction) {
        let name = interaction.options.getString('name');
        if(!('displayName' in interaction.member)) return false;
        if (interaction.member.displayName === name) return true;
        else if (!(await super.authorize(interaction))) {
            await interaction.editReply('You need board for the this command (or you need to use your own name).');
            return false;
        }
        return true;
    }

    /**
     * @type {import("./../../command.js").Execute}
     */
    async execute(interaction) {
        await interaction.deferReply();

        //Get the player name.
        let name = interaction.options.getString('name');
        //Get the player data.

        let data = player_data(name);
        let error = data.error;
        //If there is an error return it.
        if (error) return void await interaction.editReply(error);
        /**
         * @type {Partial<Stats>}
        */
        let stats = data.stats;
        //The number of columns in the grid.
        let colums = 4;

        //The grid is a 2d array of strings.
        let grid = [];

        //The index so that the data can be split into rows.
        let i = 0;
        //Loop over all the required item for the grid (value_callback is either string or function).
        for (const [grid_name, value_callback] of Object.entries(layout)) {
            let value;

            if (typeof value_callback === 'string') {
                //If the value is a string, then it is a key in the stats object.
                value = stats[value_callback];
                //if the value is not present it means that it is 0 (the lua event has never been triggerd). 
                if (!value) value = 0;
                //Format the value to be displayed in the grid.
                value = nf.format(value);
            }else {
                value = value_callback(stats);
            } 

            //if we have more then the required columns, we need to split the data into a new row.
            if (i % colums === 0 || i === 0) grid[grid.length] = [];

            //Add the data to the grid.
            grid[grid.length - 1].push(grid_name);
            grid[grid.length - 1].push(value);

            //plus 2 cause we add both name and value.
            i = i + 2;
        }
        //render the site with the grid.eta file (we read the file here so that it can be changed on the fly).
        let template = fs.readFileSync('./commands/playerdata/grid.eta', 'utf8');
        let html = await Eta.render(template, { grid, name });
        if (typeof html !== 'string') {
            console.error('[PLAYERDATA]: Error in rendering image.');
            await interaction.editReply('Error in rendering page.');
            return;
        }

        //No sandbox but we have disabled javascript so its not required.
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        //Create the page from the created browser.
        const page = await browser.newPage();
        //Disable js immediately for security reason. 
        page.setJavaScriptEnabled(false);
        //set the photo to 680 and 600.
        await page.setViewport({
            width: 1600,
            height: 1000,
            deviceScaleFactor: 1,
        });
        //Set the page content.
        await page.setContent(html);
        //Render the page
        await page.screenshot({ path: './.cache/profile.png' });
        //Close the browser and cleanup the proccess.
        await browser.close();
        //Send the photo to the user.
        await interaction.editReply({ files: ['./.cache/profile.png'] });
    }
}

let picture = new Picture();

class Json extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../../command.js").Argument[]}
        */
        let args = [
            {
                name: 'name',
                description: 'The name of the player to lookup',
                required: true,
                type: 'String',
            }
        ];
        super({
            name: 'json',
            description: 'Returns the json of the player\'s data',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.board
        });
    }


    /**
     * @type {import("./../../command.js").Authorize}
    */
    async authorize(interaction) {
        let name = interaction.options.getString('name');
        if(!('displayName' in interaction.member)) return false;
        if (interaction.member.displayName === name) return true;
        else if (!(await super.authorize(interaction))) {
            await interaction.editReply(config.getKey('Playerdata/NotAuthorized'));
            return false;
        }
        return true;
    }
    /**
     * @type {import("./../../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.deferReply();
        //Get the player name.
        let name = interaction.options.getString('name');
        //Get the player data.
        let { error, stats } = player_data(name);
        //If there is an error return it.
        if (error) {
            await interaction.editReply(error);
            return;
        }
        //Send the json to the user.
        await interaction.editReply(`\`\`\`json\n${JSON.stringify(stats, null, 4)}\`\`\``);
    }
}
let json = new Json();

class Compare extends DiscordCommand {

    constructor() {
        /**
         * @type {import("./../../command.js").Argument[]}
        */
        let args = [
            {
                name: 'name1',
                description: 'The name 1 of the player to lookup.',
                required: true,
                type: 'String',
            },
            {
                name: 'name2',
                description: 'The name 2 of the player to lookup.',
                required: true,
                type: 'String',
            },
        ];
        super({
            name: 'picture',
            description: 'Returns a photo of the player\'s data',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.board
        });
    }
    
    /**
     * @type {import("./../../command.js").Authorize}
    */
    async authorize(interaction) {
        if (!(await super.authorize(interaction))) {
            await interaction.editReply('You need board for the this command (or you need to use your own name).');
            return false;
        }

        return true;
    }

    /**
     * @type {import("./../../command.js").Execute}
     */
    async execute(interaction) {
        await interaction.deferReply();

        //Get the player name.
        let name1 = interaction.options.getString('name1');
        let name2 = interaction.options.getString('name2');
        //Get the player data.

        let data = [player_data(name1), player_data(name2)];
        //If there is an error return it.
        if (data[0].error) return void await interaction.editReply(data[0].error);
        if (data[1].error) return void await interaction.editReply(data[1].error);

        let result = profile_data_comp(data[0], data[1])
        // Color
        // Background, Table Border, H2, Table 1, Table 2

        let html_font_color = ['222831', '14FFEC', 'FF9F1C', 'F1D00A', 'EEEEEE'];
        // Font Family
        // Arial, Helvetica, Verdana, Calibri, BIZ UDPGothic
        let html_font_family = 'Consolas';
        // Font Size
        let html_font_size = [2, 2];
        // Font Size
        let html_font_weight = 500;
        // Margin on title
        let html_margin_height = 0.2
        // Table Individual Width
        let html_table_width = [15, 12, 10];
        // Table Individual Height
        let html_table_height = 60;
        // Total Browser Height
        let html_body_width = 2400;
        // Table Width Percentage
        let html_table_width_percentage = 98;
        // Total Browser Height
        let html_body_height = (2.5 + 15) * html_table_height;

        let html_code = ['<html>\n<head>\n<title></title>\n</head>\n<body style="background-color:#' + html_font_color[0] + '"><hr style="height:5px; visibility:hidden;margin:0px;border:0px;">',
        '<p style="margin-top: ' + html_margin_height + 'em;margin-bottom: 0em;color:' + html_font_color[0] + 'font-family:' + html_font_family + ';font-size:' + html_font_size[0] + 'em;">.</p>',
        '<h2 style="width: ' + html_table_width_percentage + '%;text-align:center;border-bottom: 2px solid #' + html_font_color[3] + ';line-height:0em;margin:10px auto 20px auto;color:#' + html_font_color[2] + '"><span style="background-color:#' + html_font_color[0] + ';padding:0 0.5em;font-family:' + html_font_family + ';font-size:' + html_font_size[0] + 'em;">' + lookup1 + ' & ' + lookup2 + '</span></h2>',
        //'<p style="font-family:' + html_font_family + ';font-weight:' + html_font_weight + ';font-size:' + html_font_size[0] + 'em;color:#' + html_font_color[2] + '">' + lookup + ' </p>',
        '<p style="margin-top: ' + html_margin_height + 'em;margin-bottom: 0em;color:' + html_font_color[0] + 'font-family:' + html_font_family + ';font-size:' + html_font_size[0] + 'em;">.</p>',
        '<table style="width: ' + html_table_width_percentage + '%;margin-left: auto;margin-right: auto;border: 2px solid #' + html_font_color[1] + ';border-collapse:collapse;page-break-inside:auto;">']

        let table_td_style_desc = '<td style="padding:5px 15px;border:2px solid #' + html_font_color[1] + ';font-family:' + html_font_family + ';font-weight:' + html_font_weight + ';font-size:' + html_font_size[1] + 'em;text-align:left;color:#' + html_font_color[3] + ';height:' + html_table_height + 'px;page-break-inside:avoid; page-break-after:auto;';
        let table_td_style_data = '<td style="padding:5px 15px;border:2px solid #' + html_font_color[1] + ';font-family:' + html_font_family + ';font-weight:' + html_font_weight + ';font-size:' + html_font_size[1] + 'em;text-align:right;color:#' + html_font_color[4] + ';height:' + html_table_height + 'px;page-break-inside:avoid; page-break-after:auto;';
        let table_td_style_per = '<td style="padding:5px 15px;border:2px solid #' + html_font_color[1] + ';font-family:' + html_font_family + ';font-weight:' + html_font_weight + ';font-size:' + html_font_size[1] + 'em;text-align:right;color:#' + html_font_color[4] + ';height:' + html_table_height + 'px;page-break-inside:avoid; page-break-after:auto;';
        let table_td_width = ['width:' + html_table_width[0] + '%;">', 'width:' + html_table_width[1] + '%;">', 'width:' + html_table_width[2] + '%;">'];

        // Table Contents
        for (let i = 0; i < result.length; i+=2) {
            let html_table = [];

            html_table.push('<tr>\n' + table_td_style_desc + table_td_width[0]);
            html_table.push(result[i][0]);
            html_table.push('</td>\n' + table_td_style_data + table_td_width[1]);
            html_table.push(result[i][1]);
            html_table.push('</td>\n' + table_td_style_data + table_td_width[1]);
            html_table.push(result[i][2]);
            html_table.push('</td>\n' + table_td_style_per + table_td_width[2]);
            html_table.push(result[i][3]);
            html_table.push('</td>\n' + table_td_style_desc + table_td_width[0]);
            html_table.push(result[i+1][0]);
            html_table.push('</td>\n' + table_td_style_data + table_td_width[1]);
            html_table.push(result[i+1][1]);
            html_table.push('</td>\n' + table_td_style_data + table_td_width[1]);
            html_table.push(result[i+1][2]);
            html_table.push('</td>\n' + table_td_style_per + table_td_width[2]);
            html_table.push(result[i+1][3]);
            html_table.push('</td>\n</tr>');
                
            html_code.push(html_table.join(''));
        }

        html_code.push('</table>\n</body>\n</html>');
        
        try {
            (async () => {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.setViewport({
                    width: html_body_width,
                    height: html_body_height,
                    deviceScaleFactor: 1,
                    });
                await page.setContent(html_code.join('\n'));
                await page.screenshot({path: './.cache/profile.png'});
                await browser.close();
                })()
        } catch (e) {
            await interaction.editReply({ content: 'Error when creating image.' });
        }

        //Send the photo to the user.
        await interaction.editReply({ files: ['./.cache/profile.png'] });
    }
}

let compare = new Compare();

class Playerdata extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../../command.js").Argument[]}
        */
        let args = [
            {
                type: 'Subcommand',
                command: picture,
            },
            {
                type: 'Subcommand',
                command: json,
            },
            /*
            {
                type: 'Subcommand',
                command: compare,
            }
            */
        ];
        super({
            name: 'playerdata',
            description: 'Will give you the playerdata of the player',
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.board
        });

    }
}

let command = new Playerdata();
module.exports = command;
