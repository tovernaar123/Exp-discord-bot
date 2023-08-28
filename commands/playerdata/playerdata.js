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
    'Commands used': 'CommandsUsed',
    'Rockets launched': 'RocketsLaunched',
    'Research completed': 'ResearchCompleted',
    'Machines built': 'MachinesBuilt',
    'Machines removed': 'MachinesRemoved',
    'Tiles placed': 'TilesBuilt',
    'Tiles removed': 'TilesRemoved',
    'Trees destroyed': 'TreesDestroyed',
    'Ore mined': 'OreMined',
    'Items crafted': 'ItemsCrafted',
    'Items picked up': 'ItemsPickedUp',
    'Kills': 'Kills',
    'Deaths': 'Deaths',
    'Damage dealt': 'DamageDealt',
    'Distance travelled': 'DistanceTravelled',
    'Capsules used': 'CapsulesUsed',
    'Machines repaired': 'EntityRepaired',
    'Decon planner used': 'DeconstructionPlannerUsed',
    'Map tags made': 'MapTagsMade',

    'Damage Death ratio': (stats) => {
        let damage = stats.DamageDealt || 0;
        let deaths = stats.Deaths || 0;
        return nf.format(Number((damage / deaths).toFixed(2))) || 0;
    },
    'Kill Death Ratio': (stats) => {
        let kills = stats.Kills || 0;
        let deaths = stats.Deaths || 0;
        return nf.format(Number((kills / deaths).toFixed(2))) || 0;
    },
    'Average Session time': (stats) => {
        return nf.format(Number((stats.Playtime / stats.JoinCount).toFixed(2))) || 0;
    },
    'Build to remove ratio': (stats) => {
        return nf.format(Number((stats.MachinesBuilt / stats.MachinesRemoved).toFixed(2))) || 0;
    },
    'Rockets per hour': (stats) => {
        return nf.format(Number((stats.RocketsLaunched / (stats.Playtime / 60)).toFixed(2))) || 0;
    },
    'TKPM (Tree kills per min)': (stats) => {
        return nf.format(Number((stats.TreesDestroyed / (stats.Playtime)).toFixed(2))) || 0;
    },
    'Net Play Time': (stats) => {
        let hours = Math.floor((stats.Playtime - stats.AfkTime) / 60) || 0;
        let minutes = (stats.Playtime % 60) || 0;
        return `${hours} h ${minutes} m`;
    },
    'AFK Time ratio (%)': (stats) => {
        return `${nf.format(Number((stats.AfkTime / stats.Playtime * 100).toFixed(2))) || 0}%`;
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
            }
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