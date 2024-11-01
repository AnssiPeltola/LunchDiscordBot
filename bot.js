import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} from "discord.js";
import { config } from "dotenv";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import cron from "node-cron";
import { isSleepModeEnabled } from "./commands/sleepmode.js"; // Import the sleep mode check function

config(); // Load environment variables from .env file

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const menuChannelId = process.env.MENU_CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandItems = fs.readdirSync(foldersPath);

// Load all command files and set them in the client's command collection
for (const item of commandItems) {
  const itemPath = path.join(foldersPath, item);
  if (fs.statSync(itemPath).isDirectory()) {
    const commandFiles = fs
      .readdirSync(itemPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(itemPath, file);
      const command = await import(pathToFileURL(filePath).href);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  } else if (item.endsWith(".js")) {
    const command = await import(pathToFileURL(itemPath).href);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${itemPath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

let lastPostedDate = null;

// Event listener for when the client is ready
client.once(Events.ClientReady, () => {
  console.log("Ready!");

  // Schedule daily menu posting, Mon-Fri at 9:00 AM
  cron.schedule("0 9 * * 1-5", async () => {
    if (isSleepModeEnabled()) {
      console.log("Sleep mode is enabled. Skipping menu posting.");
      return;
    }
    console.log("Cron job triggered");
    await postDailyMenuWithRetry();
  });
});

// Event listener for interaction create events
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// Function to post the daily menu with retry mechanism
async function postDailyMenuWithRetry(retries = 10, delay = 6 * 60 * 1000) {
  const today = new Date().toLocaleDateString("fi-FI", { weekday: "long" });
  const currentDate = new Date().toLocaleDateString("fi-FI");

  for (let attempt = 0; attempt < retries; attempt++) {
    const menu = await fetchDailyMenu(today.toUpperCase());

    if (menu) {
      const menuDateMatch = menu.match(/\d{1,2}\.\d{1,2}\.\d{4}/);
      if (menuDateMatch && menuDateMatch[0] === currentDate) {
        console.log(`Posting menu for ${today}`);
        await postMenu(menu);
        lastPostedDate = currentDate;
        return;
      }
    }

    console.log(
      `Menu for ${today} not found or date mismatch. Retrying in 6 minutes...`
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  console.log(`Failed to post menu for ${today} after ${retries} attempts.`);
  await postMenu(
    `Failed to find the menu for ${today} after ${retries} attempts.`
  );
}

// Function to fetch the daily menu for a given day
async function fetchDailyMenu(day) {
  const url =
    "https://sasky.fi/oppilaitokset/tampereen-palvelualan-ammattiopisto/ruokailu-ja-asuminen-2/ruokalista-tpa/";
  const response = await fetch(url);
  const body = await response.text();
  const $ = cheerio.load(body);

  // Extract all text and match the specific day's menu
  const weekText = $("body").text();

  // Adjusted regex to capture the day’s menu until the next day or end of string
  const dayMenuRegex = new RegExp(
    `${day}\\s*\\d{1,2}\\.\\d{1,2}\\.\\d{4}.*?(?=\\s*(?:MAANANTAI|TIISTAI|KESKIVIIKKO|TORSTAI|PERJANTAI|window|<script|\\(function\\()|$)`,
    "si" // case insensitive, dot matches newlines
  );

  const dayMenu = weekText.match(dayMenuRegex);
  if (dayMenu) {
    const dayAndDateMatch = dayMenu[0].match(/(\w+\s+\d{1,2}\.\d{1,2}\.\d{4})/);
    const dayAndDate = dayAndDateMatch ? dayAndDateMatch[0] : day;

    // Clean up the menu items
    const menuItems = dayMenu[0]
      .replace(dayAndDate, "")
      .split("\n")
      .filter(
        (line) =>
          line &&
          !line.includes("SASKY") &&
          !line.includes("eväste") &&
          !line.includes("function")
      )
      .join("\n");

    return `${dayAndDate}\n\n${menuItems}`;
  }

  return null;
}

// Function to post the menu to the specified channel
async function postMenu(menu) {
  const channel = client.channels.cache.get(menuChannelId);
  if (channel) {
    await channel.send(menu);
  } else {
    console.log("Menu channel not found.");
  }
}

client.login(token);

// Deploy commands
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
