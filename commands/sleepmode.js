import { SlashCommandBuilder } from "discord.js";
import fs from "node:fs";

const sleepModeFile = "sleepmode.json";

export const data = new SlashCommandBuilder()
  .setName("sleepmode")
  .setDescription("Enable or disable sleep mode")
  .addBooleanOption((option) =>
    option
      .setName("enabled")
      .setDescription("Enable or disable sleep mode")
      .setRequired(true)
  );

export async function execute(interaction) {
  const enabled = interaction.options.getBoolean("enabled");

  // Save the sleep mode state to a file
  fs.writeFileSync(sleepModeFile, JSON.stringify({ enabled }));

  await interaction.reply(
    `Sleep mode is now ${enabled ? "enabled" : "disabled"}.`
  );
}

export function isSleepModeEnabled() {
  if (fs.existsSync(sleepModeFile)) {
    const data = JSON.parse(fs.readFileSync(sleepModeFile, "utf8"));
    return data.enabled;
  }
  return false;
}
