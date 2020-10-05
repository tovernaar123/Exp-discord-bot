const Rcon = require('rcon-client');
module.exports = {
    name: 'afk',
    aka: ['whoisafk','afkstreak','alwaysafk'],
    description: 'how many players are online?',
    guildOnly: true,
    args: true,
    required_role: 'staff',
    usage: `<#>`,
    execute(msg, args) {
        const rconpw = process.env.RCONPASS;
        const server = args[0];
        const baseport = `34228`;

        let rconport = Number(server) + Number(baseport)
        let extra = args.slice(2).join(" "); // cant have any of this here for afk
        let toAFK = args[1];
        let snum = [`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`];
        let rconToSend = `/sc rcon.print(math.floor(game.players['${toAFK}'].afk_time /3600))`; //send afk chat bot


        if (!server) { // Checks to see if the person specified a server number, then checks to see if the server number is part of the array of the servers it could be (1-8 currently)
            msg.channel.send('Please pick a server first just a number (1-8). \`<#> <Serverusername>\`');
            console.log(`AFK Check not have server number`);
            return;
        }
        if (snum.indexOf(server) === -1) { // If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
            msg.channel.send(`Please pick a server first just a number (1-8).  Correct usage is afk  \`<Server#> <username>\``);
            console.log(`AFK Check incorrect server number`);
            return;
        }
        if (!toAFK) { // if no 2nd argument returns without running with error
            msg.channel.send(`You need to tell us who you would like to check for AFK time. \`<Server#> <username>\``);
            console.log(`AFK-Did not have name`);
            return;
        }
        if (extra) { // if no other arguments (after 2nd ) than returns without running with notice to provide a reason
            msg.channel.send(`No reasons (or extra arguments) needed - Please remove. \`<Server#> <username>\``);
            console.log(`AFK was given too many arguments`);
            return;
        }
        async function runCommand() {
            const rcon = new Rcon.Rcon({
                host: "127.0.0.1",
                port: `${rconport}`,
                password: `${rconpw}`
            });

            rcon.on("connect", () => console.log("connected"));
            rcon.on("authenticated", () => console.log("authenticated"));
            rcon.on("error", () => console.log("errors"));
            rcon.on("end", () => console.log("end"));

            try {	// tests to see if the connection works, if not fails to catch block 

                await rcon.connect();
                const responses = await rcon.send(rconToSend);
                rcon.end();
                if (responses === void 0) { return console.log('fail') }; // checks to see if the reply is completly void - if so then returns without running, posts in console
                if (!responses) { return respNone() }; // If Responses is blank (normal for kicks and bans) then runs function called respNone found below.
                if (responses) { return resp(); } // If repsonse by rcon/factorio exists than runs function "resp" in this case prints the rcon response instead of sucess/fail message *in kicks and bans only if player does nto exist or wrong santax

                function resp() { // reply from Rcon pasted in command chat and logged in log
                    if
                        (responses.startsWith('Cannot execute command. Error: (command):1: attempt to index field')) { msg.channel.send(`Player ${toAFK} has not been reported to be on that server`) }
                    else { msg.channel.send(`Player ${toAFK} has been AFK for the following amount of min(s): ${responses}`) }
                    console.log(responses + "min afk")
                }
                function respNone() { // ran if no reply from rcon - normal for kicks and bans because why not
                    msg.channel.send(`There was no response from the server, this is not normal for this command please ask an admin to check the logs.`);
                    console.log(`Rocn: There was no response from the server, this is not normal for this command please ask an admin to check the logs.`);
                }
            } catch (error) { //If any major fails from above will stop and run this, normally this is from a connection error, which is normally due to an offline server.
                msg.channel.send(`Error: *${error.message}* \nErrors are normally caused by trying to reach an offline server. But not always.`).then(console.log(error.name + error.message + error.stack)).then(console.log('\nServer is offline???'));
            }

            return // ends runCommand Function
        }
        runCommand();
    },
};