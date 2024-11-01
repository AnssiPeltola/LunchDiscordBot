import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

// Define the slash command for fetching and posting the lunch menu for the entire week
export const data = new SlashCommandBuilder()
  .setName("weeklunch")
  .setDescription("Fetches and posts the lunch menu for the entire week");

// Execute function to handle the interaction when the command is used
export async function execute(interaction) {
  await interaction.deferReply(); // Defer reply to allow time for processing
  const menu = await fetchWeeklyMenu(); // Fetch the weekly menu
  if (menu) {
    await interaction.editReply(menu); // Reply with the menu if found
  } else {
    await interaction.editReply("Menu for the week not found."); // Reply with an error message if the menu is not found
  }
}

// Function to fetch the weekly menu
async function fetchWeeklyMenu() {
  const url =
    "https://sasky.fi/oppilaitokset/tampereen-palvelualan-ammattiopisto/ruokailu-ja-asuminen-2/ruokalista-tpa/"; // URL of the menu page
  const response = await fetch(url); // Fetch the page content
  const body = await response.text(); // Get the text content of the page
  const $ = cheerio.load(body); // Load the content into cheerio for parsing

  const weekText = $("body").text(); // Extract all text from the body of the page
  const days = ["MAANANTAI", "TIISTAI", "KESKIVIIKKO", "TORSTAI", "PERJANTAI"]; // List of days in Finnish
  let weeklyMenu = ""; // Initialize an empty string to store the weekly menu

  // Loop through each day and extract the menu
  for (const day of days) {
    const dayMenuRegex = new RegExp(
      `${day} \\d{1,2}\\.\\d{1,2}\\.\\d{4}.*?(?=(MAANANTAI|TIISTAI|KESKIVIIKKO|TORSTAI|PERJANTAI|window|<script|$))`,
      "si" // case insensitive, dot matches newlines
    );
    const dayMenu = weekText.match(dayMenuRegex); // Match the menu for the specified day

    if (dayMenu) {
      const dayAndDateMatch = dayMenu[0].match(/(\w+ \d{2}\.\d{2}\.\d{4})/); // Extract the day and date
      const dayAndDate = dayAndDateMatch ? dayAndDateMatch[0] : day; // Use the extracted day and date or the day if not found

      const menuItems = dayMenu[0]
        .replace(dayAndDate, "") // Remove the day and date from the menu text
        .split("\n") // Split the menu text into lines
        .filter(
          (line) =>
            line &&
            !line.includes("SASKY") && // Filter out unwanted lines
            !line.includes("eväste") &&
            !line.includes("function") &&
            !line.includes("window") &&
            !line.includes("script")
        )
        .join("\n") // Join the filtered lines back into a single string
        .trim(); // Trim any leading or trailing whitespace

      if (menuItems) {
        weeklyMenu += `${dayAndDate}\n${menuItems}\n\n`; // Append the day, date, and menu items to the weekly menu
      }
    }
  }

  return weeklyMenu.trim() || null; // Return the formatted weekly menu or null if no menu is found
}
