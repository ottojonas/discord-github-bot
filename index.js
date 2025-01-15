import express from "express";
import bodyParser from "body-parser";
import pkg from "discord.js";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const { Client, GatewayIntentBits } = pkg;

const app = express();
const port = process.env.PORT || 3000;

const discordToken = process.env.DISCORD_TOKEN;
const discordChannelId = process.env.DISCORD_CHANNEL_ID;
const githubWebhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", () => {
  console.log("bot is ready");
});

client.login(discordToken);

app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// Middleware to verify GitHub webhook signature
app.use((req, res, next) => {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) {
    console.log("No signature found");
    return res.status(401).send("No signature found");
  }

  const hmac = crypto.createHmac("sha256", githubWebhookSecret);
  const digest = `sha256=${hmac.update(req.rawBody).digest("hex")}`;

  console.log(`Expected: ${digest}`);
  console.log(`Received: ${signature}`);

  if (signature !== digest) {
    console.log("Invalid signature");
    return res.status(401).send("Invalid signature");
  }

  next();
});

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
