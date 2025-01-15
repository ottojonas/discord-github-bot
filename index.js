import express from "express";
import bodyParser from "body-parser";
import { Client, Intents } from "discord.js";

const app = express();
const port = process.env.PORT || 3000;

const discordToken = process.env.DISCORD_TOKEN;
const discordChannelId = process.env.DISCORD_CHANNEL_ID;

const client = new Client({ intents: [] });

client.once("ready", () => {
  console.log("bot is ready");
});

client.login(discordToken);

app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  let message = "";

  switch (event) {
    case "push":
      message = `New commit in ${payload.repository.full_name} by ${payload.pusher.name}: ${payload.head_commit.message}`;
      break;
    case "pull_request":
      message = `New pull request in ${payload.repository.full_name} by ${payload.pull_request.user.login}: ${payload.pull_request.title}`;
      break;
    case "issues":
      message = `New issue in ${payload.repository.full_name} by ${payload.issue.user.login}: ${payload.issue.title}`;
      break;
    default:
      message = `Unhandled event: ${event}`;
  }

  const channel = client.channels.cache.get(discordChannelId);
  if (channel) {
    channel.send(message);
  }
  res.status(200).end();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
