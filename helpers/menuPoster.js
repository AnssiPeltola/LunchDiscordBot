// const { Client, GatewayIntentBits } = require("discord.js");
// const { token, clientId, guildId, menuChannelId } = require("../config.json");

// const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// function postMenu(day, menuChannelId) {
//   const channel = client.channels.cache.get(menuChannelId);
//   if (!channel || channel.type !== "GUILD_TEXT") {
//     console.error(`Invalid or missing menuChannel: ${menuChannelId}`);
//     return;
//   }

//   console.log(`Posting menu for ${day} in channel: ${channel.name}`);

//   const menu = `Here's the school lunch menu for ${day}:\n\n`; // Fetch menu from your source
//   channel
//     .send(menu)
//     .then(() => {
//       console.log(`Menu posted successfully for ${day}`);
//     })
//     .catch((error) => {
//       console.error(`Error posting menu for ${day}:`, error);
//     });
// }

// module.exports = {
//   postMenu,
// };

function postMenu(client, day, menuChannelId) {
  try {
    console.log("Menu channel ID:", menuChannelId);
    const channel = client.channels.cache.get(menuChannelId);
    if (!channel || channel.type !== "GUILD_TEXT") {
      throw new Error(`Invalid or missing menuChannel: ${menuChannelId}`);
    }

    const menu = `Here's the school lunch menu for ${day}:\n\n`; // Fetch menu from your source
    channel.send(menu);
  } catch (error) {
    console.error("Error posting menu:", error);
  }
}
module.exports = {
  postMenu,
};
