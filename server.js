require("dotenv").config();
const { Client, Intents } = require("discord.js");
const fetch = require("node-fetch");
const cron = require("node-cron");

const discordToken = process.env.DISCORD_TOKEN;
const channelId = process.env.CHANNEL_ID;
const repoOwner = "ottojonas";
const repoName = "ottos-bible";
const githubToken = process.env.GITHUB_TOKEN;
const client = new Clinet({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.once("ready", () => {
  console.log("Discord bot ready");
});

client.login(discordToken);

async function checkForUpdates() {
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
