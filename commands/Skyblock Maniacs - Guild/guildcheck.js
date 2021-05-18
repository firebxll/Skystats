const Discord = require('discord.js');
const fetch = require('node-fetch');

const yes = `<:yes:842005525414805544>`;
const no = `<:no:842005545963487242>`;
const loading = `842005585138155552`;

module.exports = {
	name: 'sbmguildcheck',
	aliases: ['sbmgc', 'sbmgcheck'],
	usage: 'guildcheck [ign] [profile]',
	tldr: 'Checks if a player meets the requirements for the Skyblock Maniacs Guild',
	description: 'Tests if a given users profile meets the requirements for the SMB Guild.\nUpdated everytime new requirements are changed.',
	modOnly: true,
	maniacsOnly: true,
	async execute(message, args) {
		delete require.cache[require.resolve('../../config.json')];
		const config = require('../../config.json');

		if (!args[0]) {
			var ign = message.member.displayName;
		} else {
			if (message.mentions.members.first()) {
				var ign = message.mentions.members.first().displayName;
			}
			else var ign = args[0];
		} // Gets IGN

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

		var scammer = await testScammer(ign);

		// At this point we know its a valid IGN, but not if it has skyblock profiles
		const apiData = await getApiData(ign); // Gets all skyblock player data from Senither's Hypixel API Facade

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

		if (scammer) {
			return message.channel.send(
				new Discord.MessageEmbed()
					.setTitle(`Denied.`)
					.setColor(`FF8C00`)
					.setFooter(`Weight: ${toFixed(apiData.data.weight + apiData.data.weight_overflow)}`)
					.setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `http://sky.shiiyu.moe/stats/${ign}`)
					.setDescription(`\`${ign}\` is on the scammers list`)
					.setTimestamp()
			).then(message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error)))
		} else if ((apiData.data.weight + apiData.data.weight_overflow) >= config.requirements.guild.sbm.weight) {
			return message.channel.send(
				new Discord.MessageEmbed()
					.setTitle(`Accepted!`)
					.setColor(`32CD32`)
					.setDescription([
						`You meet the requirements to join Skyblock Maniacs!`,
						`Before we invite you please make sure you:`,
						`- Aren't currently in a guild`,
						`- Have guild invites privacy settings on low`,
						`- Are able to accept the invite`
					].join('\n'))
					.addFields(
						{name: "Guild Roles", value: getGuildRanks(apiData), inline: true},
					)
					.setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `http://sky.shiiyu.moe/stats/${ign}`)
					.setFooter(`Your Weight: ${toFixed(apiData.data.weight + apiData.data.weight_overflow)}`)
					.setTimestamp()
			).then(message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error)))
		} else {
			return message.channel.send(
				new Discord.MessageEmbed()
					.setTitle(`Denied.`)
					.setColor(`DC143C`)
					.setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `http://sky.shiiyu.moe/stats/${ign}`)
					.setDescription(`Sorry but you don't currently have ${config.requirements.guild.sbm.weight} weight.`)
					.setFooter(`Your weight: ${toFixed(apiData.data.weight + apiData.data.weight_overflow)}`)
					.setTimestamp()
			).then(message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error)))
		}
	},
};


function getGuildRanks(apiData) {
	delete require.cache[require.resolve('../../config.json')];
	const config = require('../../config.json');

	let sm = apiData.data.skills.average_skills >= config.requirements.guild.sbm.ranks.skills.skill;
	let dm = apiData.data.dungeons.types.catacombs.level >= config.requirements.guild.sbm.ranks.dungeons.catacombs;
	if(sm) sm = yes; else sm = no;
	if(dm) dm = yes; else dm = no;

	return[
		`Dungeon Maniac: ${dm}`,
		`Skill Maniac:   ${sm}`,
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
	const response = await fetch(`https://hypixel-api.senither.com/v1/profiles/${UUID}/weight?key=${config.discord.apiKey}`);
	return await response.json();
}

async function getTrueIgn(ign) {
	const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${ign}`);
	const result = await response.json();
	return result.name;
}

function getEmoji(input) {
	if (input === true) return yes;
	else return no;
}

function toFixed(num) {
	var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (2 || -1) + '})?');
	return num.toString().match(re)[0];
}

async function getScammerData() {
	const response = await fetch('https://raw.githubusercontent.com/skyblockz/pricecheckbot/master/scammer.json');
	return await response.json();
}

async function testScammer(ign) {
	let uuid = await getUUID(ign);
	scammerData = await getScammerData();

	if (scammerData.hasOwnProperty(uuid)) return true;
	return false;
}