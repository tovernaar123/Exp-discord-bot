let Eta = require('eta');
let Discord_Command = require('./../../command.js');
const fs = require('fs');
const puppeteer = require('puppeteer');
let config = require.main.require('./config/utils.js');


config.addKey('Playerdata/Dir');

config.addKey('Playerdata/NameNotFound', 'Error: Name not found. Check the name or try again later.');

config.addKey('Playerdata/Privacy', 'Error: Privacy Settings Prevent Lookup. Check the name or try again later after turning on Data sync.');

config.addKey('Playerdata/NotAuthorized', 'You need board for the this command (or you need to use your own name).');

//Formats the numbers to be displayed in the grid (So that they have comma's every 3 digits).
const nf = new Intl.NumberFormat('en-US');
let layout = {
    'Play time': (stats) => {
        let hours = Math.floor(stats.Playtime / 60);
        let minutes = stats.Playtime % 60;
        return `${hours} h ${minutes} m`;
    },
    'AFK time': (stats) => {
        let hours = Math.floor(stats.AfkTime / 60);
        let minutes = stats.AfkTime % 60;
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
        return nf.format((stats.DamageDealt / stats.Deaths).toFixed(2));
    },
    'Kill Death Ratio': (stats) => {
        return nf.format((stats.Kills / stats.Deaths).toFixed(2));
    },
    'Average Session time': (stats) => {
        return (stats.Playtime / stats.MapsPlayed).toFixed(2);
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
function player_data(name) {
    //Read the player data file.
    let rawdata = fs.readFileSync(config.getKey('Playerdata/Dir')); ///mnt/c/programming/tools/factorio_servers/playerdata.json'
    //Take raw data and change it into Json format, to make it simpler to format/lookup
    let DataStore = JSON.parse(rawdata);

    //Get the Data of the Player.
    let PlayerData = DataStore['PlayerData'][name];
    //Checks to see if any data was retured at all, if the name is not in the database, or the database is not accessable than it will return an error and stop running the command

    if (!PlayerData) {
        return {error: config.getKey('Playerdata/NameNotFound')};
    }

    //Get the boolean to check if the player has agreed to the privacy policy.
    let privacyData = PlayerData['DataSavingPreference'];
    if (privacyData) {
        return  {error: config.getKey('Playerdata/Privacy')};
    }
    //if it didnt stop based on the name not returining it will then filter out only the Statistics (removing prefrences like alt mode, join msg etc).
    return {error: false, stats: PlayerData['Statistics']};
}


class Picture extends Discord_Command {
    constructor() {
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
            aka: [''],
            description: 'Returns a foto of the player\'s data',
            cooldown: 5,
            args: args,
            guildOnly: true,
            required_role: Discord_Command.roles.board
        });
    }

    async authorize(interaction) {
        let name = interaction.options.getString('name');
        if(interaction.member.displayName === name) return true;
        else if(! (await super.authorize(interaction))){
            await interaction.editReply('You need board for the this command (or you need to use your own name).');
            return false;
        }
        return true;
    }

    async execute(interaction) {
        await interaction.deferReply();

        //Get the player name.
        let name = interaction.options.getString('name');
        //Get the player data.
        let {error, stats } = player_data(name);
        //If there is an error return it.
        if(error) return await interaction.editReply(error);

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
            }

            else value = value_callback(stats);

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
        let html = Eta.render(template, { grid, name });

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

class Json extends Discord_Command {
    constructor() {
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
            aka: [''],
            description: 'Returns the json of the player\'s data',
            cooldown: 5,
            args: args,
            guildOnly: true,
            required_role: Discord_Command.roles.board
        });
    }

    async authorize(interaction) {
        let name = interaction.options.getString('name');
        if(interaction.member.displayName === name) return true;
        else if(! (await super.authorize(interaction))){
            await interaction.editReply(config.getKey('Playerdata/NotAuthorized'));
            return false;
        }
        return true;
    }
    async execute(interaction) {
        await interaction.deferReply();
        //Get the player name.
        let name = interaction.options.getString('name');
        //Get the player data.
        let {error, stats } = player_data(name);
        //If there is an error return it.
        if(error) return await interaction.editReply(error);
        //Send the json to the user.
        return await interaction.editReply(`\`\`\`json\n${JSON.stringify(stats, null, 4)}\`\`\``);
    }
}
let json = new Json();

class Playerdata extends Discord_Command {
    constructor() {
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
        });

    }
}

let command = new Playerdata();
module.exports = command;
