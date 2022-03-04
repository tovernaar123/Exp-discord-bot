const fs = require('fs');
const events = require('events');



class config extends events {
    static main;
    constructor() {
        super();

        config.main = this;
        this.ready = false;
        this.data = {};
        this.keys = [];
        this.defaults = {};
        //check if main.json exists if not create it
        if (fs.existsSync('./config/main.json')) {
            //if main.json exists read it
            let rawdata = fs.readFileSync('./config/main.json');
            //and load the object
            this.data = JSON.parse(rawdata);
            this.ready = true;
        }
    }

    addKey(key, defaultValue) {
        if(defaultValue){
            this.defaults[key] = defaultValue;
        }
        this.keys.push(key);
        if(!(key in this.data)){
            this.data[key] = defaultValue || '';
            this.save();
        }
    }

    getKey(key){
        return this.data[key];
    }

    setKey(key, value){
        this.data[key] = value;
        this.save();
    }
    createConfig(config_data) {
        //create a new config
        this.data = config_data;
        this.save();
        this.ready = true;
        this.emit('ready');
    }

    reload(){
        //reload the config
        let rawdata = fs.readFileSync('./config/main.json');
        this.data = JSON.parse(rawdata);
        this.emit('reload');
    }

    save() {
        //save the config
        fs.writeFileSync('./config/main.json', JSON.stringify(this.data, null, 4));
    }

}
if(!config.main) new config();
module.exports = config.main;