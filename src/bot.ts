import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});

//起動確認
client.once('ready', () => {
  if (client.user) {
    console.log(`${client.user.tag} Ready`);
  }
});

// 返答
client.on('messageCreate', async (message) => {
  if (message.author.bot) {
    return;
  }

  if (message.content.trim() == '!quote') {
    if (!message.reference || !message.reference.messageId) return;
    message.channel.sendTyping();
    const parent = await message.channel.messages.fetch(message.reference.messageId);
    message.channel.send(`### ${parent.member?.displayName} @${parent.author.username}\n> ${parent.content.replace(/\n/g, '\n> ')}`);
  }
});

// Discordへの接続
client.login(process.env.DISCORD_TOKEN);
