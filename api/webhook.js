const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

discordClient.login(DISCORD_TOKEN);

discordClient.once("ready", () => {
  console.log("Online");
});

function handlePushEvent(payload) {
  const commitMessages = payload.commits.map((commit) => commit.message);
  const branch = payload.ref.split("/").pop();
  const repoName = payload.repository.name;
  const message = `New commits pushed to the repository ${repoName} (Branch: ${branch}): - ${commitMessages.join(
    "\n - "
  )}`;
  sendMessageToDiscord(message);
}

function handlePullRequestEvent(payload) {
  const action = payload.action;
  const prTitle = payload.pull_request.title;
  const prUrl = payload.pull_request.html_url;
  const user = payload.pull_request.user.login;
  const message = `Pull Request ${action}: - **Title**: ${prTitle} - **User**: ${user} - **URL**: ${prUrl}`;
  sendMessageToDiscord(message);
}

function handleIssuesEvent(payload) {
  const action = payload.action;
  const issueTitle = payload.issue.title;
  const issueUrl = payload.issue.html_url;
  const user = payload.issue.user.login;
  const message = `Issue ${action}: - **Title**: ${issueTitle} - **User**: ${user} - **URL**: ${issueUrl}`;
  sendMessageToDiscord(message);
}

function sendMessageToDiscord(message) {
  const channel = discordClient.channels.cache.get(DISCORD_CHANNEL_ID);
  if (channel) {
    channel.send(message);
  }
}

module.exports = (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;
  if (event === "push") {
    handlePushEvent(payload);
  } else if (event === "pull_request") {
    handlePullRequestEvent(payload);
  } else if (event === "issues") {
    handleIssuesEvent(payload);
  }
  res.status(200).send("OK");
};
