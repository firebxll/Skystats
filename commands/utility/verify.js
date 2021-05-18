const Discord = require('discord.js')
const https = require('https')

module.exports = {
    name: 'verify',
    aliases: ['v'],
    usage: 'verify <ign>',
    description: 'Verifies the user by connecting to the hypixel api',
    ownerOnly: false,
    maniacsOnly: true,
    execute(message, args, client) {
        delete require.cache[require.resolve('../../config.json')];
        const config = require('../../config.json');

        if(!args[0] || args[0] == null) {
            message.author.send('Please use the right syntax! -verify [ign]');
            return;
        }
		
        let ign = args[0];
        verify(message, ign, 'Verify', client)
        let verified = message.guild.roles.cache.find(role => role.id == 'place id here')

function verify(message, ign, type, client){
    let url = `https://api.hypixel.net/player?name=${ign}&key=${config.discord.apiKey}`
    https
    .get(url, resp => {
        let data = " ";
        resp.on("data", chunk => {
            data += chunk;
        })
        resp.on('end', () => {
            let success = JSON.parse(data).success
            if(!success){
                message.reply('There was an error while tryign to fetch your data please try again later!')
                return;
            }
            if(JSON.parse(data).player.socialMedia){
                if(JSON.parse(data).player.socialMedia.links){
                    if(JSON.parse(data).player.socialMedia.links.DISCORD){
                        let discord = JSON.parse(data).player.socialMedia.links.DISCORD;
                        if(discord != message.author.tag) return message.reply('Your discord tag does not match your tag from hypixel api. Please double check that you verified the right account.')
                        console.log(`${message.author.username} has verified`)
                        message.delete()
                        message.channel.send(
                            new Discord.MessageEmbed()
                                .setTitle("Success!")
                                .setDescription(`${message.author} has succesfully verified!`)
                                .setTimestamp()
                                .setColor('7CFC00')
                        )
                        message.member.setNickname(ign)
                        member.roles.add(verified)
                    }else if(!JSON.parse(data).player.socialMedia.links.DISCORD) return message.reply('Please link your discord account to hypixel account before doing this');
                }else if(!JSON.parse(data).player.socialMedia.links) return message.reply('Please link your discord account to hypixel account before doing this');
            }else if(!JSON.parse(data).player.socialMedia) return message.reply('Please link your discord account to hypixel account before doing this');
        })
    })
    .on('error', err => {
        message.reply('There was an error while trying to fetch your profile please try again.')
        console.error(err);
        return;
    })
}
    
}

}