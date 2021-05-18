const Discord = require('discord.js');
const fetch = require('node-fetch');

const loading = `842005585138155552`

module.exports = {
    name: 'dungeons',
    aliases: ['cata', 'catacombs', 'dungeon', 'd'],
    usage: 'dungeons [ign] [profile]',
    description: "Gets players dungeons information",
    async execute(message, args) {
        if (!args[0]) {
            var ign = message.member.displayName;
        } else {
            if (message.mentions.members.first()) {
                var ign = message.mentions.members.first().displayName;
            }
            else var ign = args[0];
        } // Gets IGN

        var method = 'save';
        if (args[1]) method = args[1];

        ign = ign.replace(/\W/g, ''); // removes weird characters

        message.react(loading);

        fetch(`https://api.mojang.com/users/profiles/minecraft/${ign}`)
            .then(res => {
                if (res.status != 200) {
                    return message.channel.send(
                        new Discord.MessageEmbed()
                            .setDescription(`No Minecraft account found for \`${ign}\``)
                            .setColor('DC143C')
                            .setTimestamp()
                    ).then(message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error)))
                }
            }); // Test if IGN esists

        ign = await getTrueIgn(ign);

        // At this point we know its a valid IGN, but not if it has skyblock profiles
        const apiData = await getApiData(ign, method); // Gets all skyblock player data from Senither's Hypixel API Facade

        if (apiData.status != 200) {
            return message.channel.send(
                new Discord.MessageEmbed()
                    .setDescription(apiData.reason)
                    .setColor('DC143C')
                    .setTimestamp()
            ).then(message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error)))
        }
        if (apiData.data.dungeons.types.catacombs.fastest_time.tier_7.time == null) {
			return message.channel.send(
				new MessageEmbed()
					.setDescription(`\`${ign}\` hasn't completed Floor 7`)
					.setColor('DC143C')
			)
        }
        // IGN is valid and player has skyblock profiles

        return message.channel.send( // EDIT THIS BIT
            new Discord.MessageEmbed()  
                .setTitle(`Dungeons Stats for ${ign}`)
                .setColor('7CFC00')
                .setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `http://sky.shiiyu.moe/stats/${ign}`)
                .setFooter(`Your Dungeons Weight: ${toFixed(apiData.data.dungeons.weight + apiData.data.dungeons.weight_overflow)}`)
                .addFields(
                    {name: "Catacombs Level", value: toFixed(apiData.data.dungeons.types.catacombs.level), inline: true},
                    {name: "Secret Count", value: toFixed(apiData.data.dungeons.secrets_found), inline: true},
                    {name: "Floor 7 PB", value: getPersonalBest(apiData), inline: true},
                )
                .setTimestamp()
        ).then(message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error)))
    },
};

function getPersonalBest(apiData) {
    const f7 = apiData.data.dungeons.types.catacombs.fastest_time.tier_7.time

    return[
        `Floor 7: ${f7}`,
    ].join('\n');
}

async function getUUID(ign) {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${ign}`);
    const result = await response.json();
    return result.id;
}

async function getApiData(ign, method) {
    delete require.cache[require.resolve('../../config.json')];
    const config = require('../../config.json');

    const UUID = await getUUID(ign);
    const response = await fetch(`https://hypixel-api.senither.com/v1/profiles/${UUID}/${method}?key=${config.discord.apiKey}`);
    return await response.json();
}

async function getTrueIgn(ign) {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${ign}`);
    const result = await response.json();
    return result.name;
}

function toFixed(num) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (2 || -1) + '})?');
    return num.toString().match(re)[0];
}