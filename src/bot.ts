import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { generate } from './generateImage.js';

const client = new Client({
  'intents': [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  'partials': [Partials.Channel],
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
    message.channel.send({
      files: [
        {
          attachment: await generate(
            parent.author.username,
            parent.member?.displayName || parent.author.displayName,
            parent.author.displayAvatarURL({ extension: 'png', size: 4096 }),
            parent.content,
          ),
        },
      ],
    });
  }
});

// Discordへの接続
client.login(process.env.DISCORD_TOKEN);
