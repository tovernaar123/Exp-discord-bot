module.exports = {
    name: 'log',
    aka: ['dlchat', 'logs'],
    description: 'get chat (last 10 lines) (Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.staff, 
    usage: ` <server#> <lines>`,
    execute(msg, args, rcons, internal_error) {
        const readLastLines = require(`read-last-lines`);
        const server = args[0];
        let extra = args.slice(2).join(" ");
        let size = args[1];
        let snum = [`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`];
        let sizeLimit = 50;
        let defaultSize = 10;

        if (!server) {
            msg.channel.send('Please pick a server first just a number (1-8)');
            return;
        }
        if (snum.indexOf(server) === -1) {
            msg.channel.send(`Please pick a server first just a number (1-8).  Correct usage is jail \`<#> <username> <reason>\``);
            return;
        }
        if (extra) {
            msg.channel.send(`Correct usage is log \`<#>\``);
            return;
        }

        function newSize() {
            newerSize = defaultSize;
            if (size > 0 && size < sizeLimit) {
                newerSize = size;
            }
            console.log(`newsize = ${newerSize}`)
            return newerSize
        }
        newSize();
        function newSizeHelper() {
            sizeWarn = `Last ${defaultSize} lines fetched from *S${server}* \n**This is the default number of last lines fetched.** \nPlease be reasonable in your request. - Max: ${sizeLimit - 1}`;
            sizeHelper = sizeWarn;
            if (size > 0 && size < sizeLimit) {
                sizeHelper = `Last ${newerSize} lines fetched from *Server S${server}*`;
            }
            console.log(`sizeHelper`);

            return sizeHelper
        }
        newSizeHelper();

        readLastLines.read(`/home/factorio/servers/eu-0${server}/console.log`, newerSize)
            .then(msg.channel.send(sizeHelper + "."))
            .then((lines) => msg.channel.send(lines, { split: true })) // lines gets returned with last X (see above) lines and sent to same channel as command
            //.then(sntmsg => {sntmsg.delete({ timeout: timeOut })}) // done in MS 60,000 = 60 sec = 1 min
            //.then(msg.channel.send(`Chat was posted then deleted after 60 seconds to save space.`)) // this message gests sent too earl for some reason, then is confusing me right now.
            //.catch(msg.channel.send(`Error. Can't Delete Chat after x seconds`))) // removed command to catch errors not currently needed
            .then(console.log(`The last ${newerSize} lines of the log for server #${server} posted in ${msg.channel.name}. (asked for ${size})`)); // logs the command in the console log
        //.catch(msg.channel.send(`Error. Can't Delete Chat after X seconds`)); // removed command to catch errors not currently used

    },
};