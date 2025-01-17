const Discord = require('discord.js');
const fetch = require('node-fetch');

const loading = `842005585138155552`

module.exports = {
    name: 'skills',
    aliases: ['skill', 'sk'],
    usage: 'skills [ign] [profile]',
    description: "Gets player skills info",
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

        // IGN is valid and player has skyblock profiles

        if (apiData.data.skills.apiEnabled == false) return message.channel.send(
            new Discord.MessageEmbed()
                .setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `https://sky.shiiyu.moe/stats/${ign}`)
                .setDescription('You currently have skills API disabled, please enable it in the skyblock menu and try again')
                .setColor('DC143C')
                .setTimestamp()
        ).then(message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error)))

        return message.channel.send( // EDIT THIS BIT
            new Discord.MessageEmbed()
                .setTitle(`Skill Data for ${ign}`)
                .setColor('7CFC00')
                .setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `http://sky.shiiyu.moe/stats/${ign}`)
                .setFooter(`${ign}'s Skill Average: ${toFixed(apiData.data.skills.average_skills)}`)
                .addFields(
                    {name: "Mining", value: `${toFixed(apiData.data.skills.mining.level)}`, inline: true},
                    {name: "Foraging", value: `${toFixed(apiData.data.skills.foraging.level)}`, inline: true},
                    {name: "Enchanting", value: `${toFixed(apiData.data.skills.enchanting.level)}`, inline: true},
                    {name: "Farming", value: `${toFixed(apiData.data.skills.farming.level)}`, inline: true},
                    {name: "Combat", value: `${toFixed(apiData.data.skills.combat.level)}`, inline: true},
                    {name: "Fishing", value: `${toFixed(apiData.data.skills.fishing.level)}`, inline: true},
                    {name: "Alchemy", value: `${toFixed(apiData.data.skills.alchemy.level)}`, inline: true},
                    {name: "Taming", value: `${toFixed(apiData.data.skills.taming.level)}`, inline: true}
                )
                .setTimestamp()
        )
    },
};

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