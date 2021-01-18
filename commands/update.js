let { spawn } = require("child_process");
let shell = spawn('/bin/bash')

shell.stdout.on('data', data => {
    console.log(`stdout:\n${data}`);
});

shell.stderr.on('data', data => {
    console.error(`stderr: ${data}`);
});




async function run_command(msg, args, internal_error) {
    let branch = args[0]
    if (branch) {
        shell.stdin.write(`git fetch; git checkout origin/${branch}\n`);
        await msg.reply('Updating bot will restart now')
        shell.stdin.write(`pm2 restart infoBot\n`);
    }else{
        await msg.reply('need a branch.')
    }
}

module.exports = {
    name: 'update-bot',
    aka: ['upb, update'],
    description: 'update the bot from the github',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.staff,
    usage: `<branch>`,
    execute(msg, args, _, internal_error) {
        
        if(message.member.roles.cache.find(r => r.id === "678245941639381010") || message.member.roles.cache.find(r => r.id === "290940523844468738") message.member.roles.cache.find(r => r.id === "764526097768644618")) 
        {// if Contributing Dev (PROD), Admin (PROD), Admin (test server)
            run_command(msg, args, internal_error)
                .catch((err) => { internal_error(err); return })   
        }else{msg.channel.send(`You do not seem to have the right role`); console.log('someone (${msg.member.displayName}) Tried to update the bot but does not have access')}
        
    }
}
