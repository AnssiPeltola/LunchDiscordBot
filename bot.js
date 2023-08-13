require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();

const token = process.env.BOT_TOKEN;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (message) => {
  if (message.content.toLowerCase() === "!weeklymeny") {
    // Replace this with your code to send the weekly menu
    message.channel.send("Here is the weekly menu:");
  }

  if (message.content.toLowerCase() === "!todaymenu") {
    // Replace this with your code to send today's menu
    message.channel.send("Here is today's menu:");
  }
});

client.login(token);
