import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

// Define the slash command for fetching and posting the lunch menu
export const data = new SlashCommandBuilder()
  .setName("lunch")
  .setDescription("Fetches and posts the lunch menu");

// Execute function to handle the interaction when the command is used
export async function execute(interaction) {
  await interaction.deferReply(); // Defer reply to allow time for processing
  const day = new Date().toLocaleDateString("fi-FI", { weekday: "long" }); // Get the current day in Finnish
  const menu = await fetchDailyMenu(day.toUpperCase()); // Fetch the daily menu for the current day
  if (menu) {
    await interaction.editReply(menu); // Reply with the menu if found
  } else {
    await interaction.editReply(`Menu for ${day} not found.`); // Reply with an error message if the menu is not found
  }
}

// Function to fetch the daily menu for a given day
async function fetchDailyMenu(day) {
  const url =
    "https://sasky.fi/oppilaitokset/tampereen-palvelualan-ammattiopisto/ruokailu-ja-asuminen-2/ruokalista-tpa/"; // URL of the menu page
  const response = await fetch(url); // Fetch the page content
  const body = await response.text(); // Get the text content of the page
  const $ = cheerio.load(body); // Load the content into cheerio for parsing

  const weekText = $("body").text(); // Extract all text from the body of the page

  // Adjusted regex to capture up to Friday's menu and stop if 'window' or '<script>' appears
  const dayMenuRegex = new RegExp(
    `${day}\\s*\\d{1,2}\\.\\d{1,2}\\.\\d{4}.*?(?=(MAANANTAI|TIISTAI|KESKIVIIKKO|TORSTAI|PERJANTAI|window|<script|$))`,
    "si" // case insensitive, dot matches newlines
  );

  const dayMenu = weekText.match(dayMenuRegex); // Match the menu for the specified day
  if (dayMenu) {
    const dayAndDateMatch = dayMenu[0].match(/(\w+\s+\d{1,2}\.\d{1,2}\.\d{4})/); // Extract the day and date
    const dayAndDate = dayAndDateMatch ? dayAndDateMatch[0] : day; // Use the extracted day and date or the day if not found

    const menuItems = dayMenu[0]
      .replace(dayAndDate, "") // Remove the day and date from the menu text
      .split("\n") // Split the menu text into lines
      .filter(
        (line) =>
          line &&
          !line.includes("SASKY") && // Filter out unwanted lines
          !line.includes("eväste") &&
          !line.includes("function")
      )
      .join("\n"); // Join the filtered lines back into a single string

    return `${dayAndDate}\n\n${menuItems}`; // Return the formatted menu
  }

  return null; // Return null if no menu is found
}
