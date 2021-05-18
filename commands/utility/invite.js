const Discord = require("discord.js")

module.exports = {
    name: 'invite',
    aliases: ['i'],
    usage: 'i',
    description: 'Gives an invite link for the Skystats Bot',
    ownerOnly: false,
    execute(message, args) {
        return message.channel.send(
            new Discord.MessageEmbed()
            .setTitle('Skystats')
            .setDescription(`Invite [Skystats](https://discord.com/api/oauth2/authorize?client_id=839494994246762507&permissions=1879418945&scope=bot) :heart:`)
            .setColor(Math.floor(Math.random() * 16777215).toString(16))
            .addFields(
                {name: "Any questions?", value: "Dm <@444806963415482369>", inline: true}
            )
        )

    },
};