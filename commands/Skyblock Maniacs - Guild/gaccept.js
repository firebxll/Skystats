const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'guildaccept',
	aliases: ['ga'],
	usage: 'guildaccept <@user>',
	tldr: 'Accepts a user for the eternal velocity guild',
	description: 'Used for mods to give the guild member role easily',
	modOnly: true,
    execute (message, args) {
        if (!message.guild.id == ('839263706809761872')) {
            return message.reply("this command is only available in the Skyblock Maniacs - Guild discord server.")
        }
        const member = message.mentions.members.first();
        let GuildMember = message.guild.roles.cache.find(role => role.id == "839268679288094781")
        member.roles.add(GuildMember)

        message.channel.send(`${member} be sure to read <#839575522401058896>. If you break any of these rules you will be punished.`)
    }
}