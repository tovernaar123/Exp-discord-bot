function ts(x) {
    if (x === undefined) {
        return 0;
    } else {
        try {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } catch(e) {
            return 0;
        }
    }
}

function pprint(val, len, char) {
    if (char == '\t') {
        var al = (len - val.length);
        var at = Math.floor(al / 4);

        try {
            return (val + Array(at + 1).join(char) + Array(al - (at * 4) + 1).join(' '));
         } catch (e) {
            return (val + Array(1).join(' '));
         }

    } else {
        var as = len - val.length;

        try {
            return (val + Array(as + 1).join(char || ' '));
         } catch (e) {
            return (val + Array(1).join(char || ' '));
         }
    }
}

function profile(msg_2) {
    var layout = [['Playtime', 'AfkTime'], ['MapsPlayed', 'JoinCount'], ['ChatMessages', 'CommandsUsed'], ['RocketsLaunched', 'ResearchCompleted'], ['MachinesBuilt', 'Machines Removed'], ['TilesBuilt', 'TilesRemoved'], ['TreesDestroyed', 'OreMined'], ['ItemsCrafted', 'ItemsPickedUp'], ['Kills', 'Deaths'], ['DamageDealt', 'DistanceTravelled'], ['CapsulesUsed', 'EntityRepaired'], ['DeconstructionPlannerUsed', 'MapTagsMade']];
    var layout_text = [['Play Time', 'Afk Time'], ['Maps Played', 'Join Count'], ['Chat Messages', 'Commands'], ['Rockets Launched', 'Research Completed'], ['Machines Built', 'Machines Removed'], ['Tiles Placed', 'Tiles Removed'], ['Trees Destroyed', 'Ore Mined'], ['Items Crafted', 'Items Picked Up'], ['Kills', 'Deaths'], ['Damage Dealt', 'Distance Travelled'], ['Capsules Used', 'Machines Repaired'], ['Decon Planner Used', 'Map Tags Created']]
    var msg_4 = [];
    var msg_5 = [];

    for (let i = 0; i < layout.length; i++) {
        var msg_3 = [];

        for (let j = 0; j < layout[i].length; j++) {
            if (layout[i][j] == 'Playtime' || layout[i][j] == 'AfkTime') {
                var t1 = msg_2[layout[i][j]];
                var h1 = Math.floor(t1 / 60);
                var m1 = Math.floor(t1 % 60);

                if (h1 > 0) {
                    // msg_3.push('Play Time: ' + pad(h1, 2) + ':' + pad(m1, 2));
                    msg_3.push(layout_text[i][j]);
                    msg_3.push(h1 + ' h ' + m1 + ' m');
                } else {
                    // msg_3.push('Play Time: ' + pad(h1, 2) + ':' + pad(m1, 2));
                    msg_3.push(layout_text[i][j]);
                    msg_3.push(m1 + ' m ');
                }

            } else {
                msg_3.push(layout_text[i][j])
                msg_3.push(ts(msg_2[layout[i][j]]));
            }
        }

        msg_4.push([msg_3[0], msg_3[1], msg_3[2], msg_3[3]]);

    }

    for (let i = 0; i < msg_4.length; i++) {
        var space = '\t';
        var descr_len = 20;
        var num_len = 12;
        msg_5.push(pprint(msg_4[i][0], descr_len, space) + pprint(msg_4[i][1], num_len, space) + pprint(msg_4[i][2], descr_len, space) + pprint(msg_4[i][3], num_len, space))
    }

    return msg_5.join('\n');
}
