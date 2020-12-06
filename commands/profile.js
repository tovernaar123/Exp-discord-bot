function profile(msg_2) {
    var msg_3 = [];
    const pad = (num, places) => String(num).padStart(places, '0');

    function ts(x) {
        try {
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        } catch(e) {
            return 0;
        }
    }

    msg_3.push('Statistics:')
    msg_3.push('Main:')
    var t1 = msg_2['Playtime'];
    var h1 = Math.floor(t1 / 3600);
    var m1 = Math.floor(t1 % 3600 / 60);
    var s1 = t1 % 60;

    if (h1 > 0) {
        msg_3.push('Play Time: ' + pad(h1, 2) + ':' + pad(m1, 2) + ':' + pad(s1, 2));
        // msg_2.push('Play Time: ' + h1 + ' hrs ' + m3 + ' min ' + s1 + ' sec.')
    } else if (m1 > 0) {
        msg_3.push('Play Time: ' + pad(h1, 2) + ':' + pad(m1, 2) + ':' + pad(s1, 2));
        // msg_2.push('Play Time: ' + m1 + ' min ' + s1 + ' sec.')
    } else {
        msg_3.push('Play Time: ' + pad(h1, 2) + ':' + pad(m1, 2) + ':' + pad(s1, 2));
        // msg_2.push('Play Time: ' + s1 + ' sec.')
    }

    var t2 = msg_2['AfkTime'];
    var h2 = Math.floor(t2 / 3600);
    var m2 = Math.floor(t2 % 3600 / 60);
    var s2 = t2 % 60;

    if (h2 > 0) {
        msg_3.push('Afk Time: ' + ts(pad(h2, 2)) + ':' + pad(m2, 2) + ':' + pad(s2, 2));
        // msg_2.push('Afk Time: ' + h2 + ' hrs ' + m2 + ' min ' + s2 + ' sec.')
    } else if (m2 > 0) {
        msg_3.push('Afk Time: ' + ts(pad(h2, 2)) + ':' + pad(m2, 2) + ':' + pad(s2, 2));
        // msg_2.push('Afk Time: ' + m2 + ' min ' + s2 + ' sec.')
    } else {
        msg_3.push('Afk Time: ' + ts(pad(h2, 2)) + ':' + pad(m2, 2) + ':' + pad(s2, 2));
        // msg_2.push('Afk Time: ' + s2 + ' sec.')
    }

    msg_3.push('Maps Played: ' + ts(msg_2['MapsPlayed']));
    msg_3.push('Join Count: ' + ts(msg_2['JoinCount']));
    msg_3.push('Chat Messages: ' + ts(msg_2['ChatMessages']));
    msg_3.push('Commands Used: ' + ts(msg_2['CommandsUsed']));

    msg_3.push('\nGameplay:')
    msg_3.push('Distance Travelled: ' + ts(msg_2['DistanceTravelled']));
    msg_3.push('Kills: ' + ts(msg_2['Kills']));
    msg_3.push('Damage Dealt: ' + ts(msg_2['DamageDealt']));
    msg_3.push('Deaths: ' + ts(msg_2['Deaths']));
    msg_3.push('Deconstruction Planner Used: ' + ts(msg_2['DeconstructionPlannerUsed']));
    msg_3.push('Trees Destroyed: ' + ts(msg_2['TreesDestroyed']));
    msg_3.push('Capsules used: ' + ts(msg_2['CapsulesUsed']));

    msg_3.push('\nAchievements:')
    msg_3.push('Machines built: ' + ts(msg_2['MachinesBuilt']));
    msg_3.push('Machines removed: ' + ts(msg_2['Machines Removed']));
    msg_3.push('Research completed: ' + ts(msg_2['ResearchCompleted']));
    msg_3.push('Rockets launched: ' + ts(msg_2['RocketsLaunched']));

    msg_3.push('\nOthers')
    msg_3.push('Map tags made: ' + ts(msg_2['MapTagsMade']));
    msg_3.push('Items crafted: ' + ts(msg_2['ItemsCrafted']));
    msg_3.push('Entity repaired: ' + ts(msg_2['EntityRepaired']));
    msg_3.push('Items picked Up: ' + ts(msg_2['ItemsPickedUp']));
    msg_3.push('Tiles built: ' + ts(msg_2['TilesBuilt']));
    msg_3.push('Tiles removed: ' + ts(msg_2['TilesRemoved']));
    msg_3.push('Ore mined: ' + ts(msg_2['OreMined']));

    msg_3 = msg_3.join('\n')
    
    return msg_3
}

console.log(profile(msg['aldldl']['Statistics']));

module.exports = {
    name: 'profile',
    aka: ['pro'],
    description: 'profile of a player',
    guildOnly: true,
    args: true,
    usage: ` <playerid>`,
    execute(msg, args, rcons, internal_error) {
        //find author
        const author = msg.author.username; 
        if (args[0] == 'me') {
            var player = author;
        } else {
            var player = args[0];
        }

        try {
            // grab detail from player
            // need to work on this
            var pd = {};
            msg.channel.send(profile(pd[player]['Statistics']))
        } catch(e) {
            // pass
            msg.channel.send('Error')
        }
    }
}
