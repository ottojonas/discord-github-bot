const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

discordClient.login(DISCORD_TOKEN);

discordClient.once("ready", () => {
  console.log("Online");
});


