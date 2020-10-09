const Rcon = require('rcon-client');
const baseport = 34228;
module.exports = {
    name: 'ao',
    aka: ['adminonline','adminsonline','ao'],
    description: 'how many players are online?',
    guildOnly: true,
    args: true,
    usage: `<#>`,
    execute(msg, args) {
        const rconpw = process.env.RCONPASS;
        const rconToSend = `/sc local admins, ctn = {}, 0 for _, p in ipairs(game.connected_players) do if p.admin then ctn = ctn + 1 admins[ctn] = p.name end end rcon.print('Online: '..ctn..': '..table.concat(admins, ', '))`; //get Admins, then add count, then display.
        const server = args[0];
        const extra = args.slice(1).join(" "); // nothing extra please for this command
        const rconport = Number(server) + baseport;
        let snum = [`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`];

        if (!server) 
        { // Checks to see if the person specified a server number, then checks to see if the server number is part of the array of the servers it could be (1-8 currently)
            msg.channel.send(`Please pick a server. Just the number - ie S1 would be \`1\` (Currently 1-8). Correct usage is \`ao <Server#>\``);
            console.log(`AO Check does not have server number`);
            return;
        }
        if (server < 9 && server > 0) 
        { // If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
            msg.channel.send(`This does not seem to be a valid server number. We need just the number (1-8) ie S1 would be \`1\`.\nCorrect usage is \`ao <Server#>\``);
            console.log(`AO provided an invalid server number`);
            return;
        }
        if (extra) 
        { // if no other arguments (after 1st ) than returns without running with notice to provide a reason
            msg.channel.send(`No reasons (or extra arguments) needed - Please remove "${extra}". Correct usage: \`ao <Server#>\``);
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
            rcon.on("error", (err) => console.log(err));
            rcon.on("end", () => console.log("end"));

            try {	// tests to see if the connection works, if not fails to catch block 

                await rcon.connect();
                const responses = await rcon.send(rconToSend);
                rcon.end();
                await rcon.end();
                if (responses === void 0) { return console.log('fail') }; // checks to see if the reply is completly void - if so then returns without running, posts in console
                if (!responses) { return respNone() }; // If Responses is blank (normal for kicks and bans) then runs function called respNone found below.
                if (responses) { return resp(); } // If repsonse by rcon/factorio exists than runs function "resp" in this case prints the rcon response instead of sucess/fail message *in kicks and bans only if player does nto exist or wrong santax

                function resp() { // reply from Rcon pasted in command chat and logged in log
                    msg.channel.send(`The server replied: ${responses}`) 
                    console.log(`S${server} checked admins online: ${responses}`)
                }
                function respNone() { // ran if no reply from rcon - normal for kicks and bans because why not
                    msg.channel.send(`AO - There was no response from the server, this is not normal for this command please ask an admin to check the logs.`);
                    console.log(`Rocn: There was no response (Admins Online), this is not normal for this command please ask an admin to check the logs.`);
                }
            } catch (error) { //If any major fails from above will stop and run this, normally this is from a connection error, which is normally due to an offline server.
                msg.channel.send(`Error: *${error.message}* \nErrors are normally caused by trying to reach an offline server. But not always.`).then(console.log(error.name + error.message + error.stack)).then(console.log('\nServer is offline???'));
            }

            return; // ends runCommand Function
        }
        runCommand();
    },
};
