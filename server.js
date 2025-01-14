require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const cron = require("node-cron");

const discordToken = process.env.DISCORD_TOKEN;
const channelId = process.env.CHANNEL_ID;
const repoOwner = "ottojonas";
const repoName = "ottos-bible";
const githubToken = process.env.GITHUB_TOKEN;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", () => {
  console.log("Discord bot ready");
});

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

client.login(discordToken).catch((error) => {
  console.error("Failed to login:", error);
});

async function checkForUpdates() {
  const fetch = (await import("node-fetch")).default;
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/events`,
    {
      headers: {
        Authorization: `token ${githubToken}`,
      },
    }
  );
  const events = await response.json();

  if (events && events.length > 0) {
    const latestEvent = events[0];
    const message =
      `New update in repository: ${repoOwner}/${repoName}\n` +
      `Event: ${latestEvent.type}\n` +
      `Details: ${
        latestEvent.payload.commits
          ? latestEvent.payload.commits[0].message
          : "No commit message"
      }`;
    client.channels
      .fetch(channelId)
      .then((channel) => channel.send(message))
      .catch(console.error);
  }
}

cron.schedule("*/10 * * * *", checkForUpdates);

client.on("messageCreate", (message) => {
  if (message.content === "!checkUpdates") {
    checkForUpdates();
  }
});
