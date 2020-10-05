const rconpw = process.env.RCONPASS;
module.exports = {
    name: 'kick',
    aka: ['boot,kicks,out,bye'],
    description: 'Kick any user (Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'canKick',
    required_role: 'staff',
    usage: ` <username> <reason>`,
    execute(msg, args) {
        const Rcon = require('rcon-client');
        const author = msg.author.username; //find author
        const baseport = 34228;
        const server = args[0];
        const rconport = Number(server) + baseport;

        let reason1 = args.slice(2).join(" ");
        let toKick = args[1];
        let snum = [`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`];

        if (!server) { // Checks to see if the person specified a server number, then checks to see if the server number is part of the array of the servers it could be (1-8 currently)
            msg.channel.send('Please pick a server first just a number (1-8). \`<#> <username> <reason>\`');
            console.log(`Kick-Did not have server number`);
            return;
        }
        if (snum.indexOf(server) === -1) { // If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
            msg.channel.send(`Please pick a server first just a number (1-8).  Correct usage is kick \`<#> <username> <reason>\``);
            console.log(`Kick-Had incorrect server number`);
            return;
        }
        if (!toKick) { // if no 2nd argument returns without running with error
            msg.channel.send(`You need to tell us who you would like to kick for us to be able to kick them. \`<#> <username> <reason>\``);
            console.log(`Kick-Did not have name`);
            return;
        }
        if (!reason1) { // if no other arguments (after 2nd ) than returns without running with notice to provide a reason
            msg.channel.send(`Please put a reason, you can always rekick or reban later with a better one.\`<#> <username> <reason>\``);
            console.log(`Kick-Did not have reason`);
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
                const responses = await rcon.send(`/kick ${toKick} ${reason1}`);
                rcon.end();
                if (responses === void 0) { return console.log('fail') }; // checks to see if the reply is completly void - if so then returns without running, posts in console
                if (!responses) { return respNone() }; // If Responses is blank (normal for kicks and bans) then runs function called respNone found below.
                if (responses) { return resp(); } // If repsonse by rcon/factorio exists than runs function "resp" in this case prints the rcon response instead of sucess/fail message *in kicks and bans only if player does nto exist or wrong santax

                function resp() { // reply from Rcon pasted in command chat and logged in log
                    msg.channel.send(responses)
                    console.log(responses + `.`)
                }
                function respNone() { // ran if no reply from rcon - normal for kicks and bans because why not
                    msg.channel.send(` User **${toKick}** should have been kicked for *${reason1}*, check with someone to be sure S${server}`);
                    console.log(`Rocn: ${responses}`);
                    let reportChan = msg.guild.channels.cache.get('368812365594230788'); // Reports channel is "368812365594230788"
                    reportChan.send(`${author} kicked ${toKick} on S${server} for ${reason1}`);
                }
            } catch (error) { //If any major fails from above will stop and run this, normally this is from a connection error, which is normally due to an offline server.
                msg.channel.send(`Error: *${error.message}* \nErrors are normally caused by trying to reach an offline server. But not always.`).then(console.log(error.name + error.message + error.stack)).then(console.log('\nServer is offline???'));
            }

            return // ends runCommand Function
        }
        runCommand(); // Actually runs the function above
    },
};