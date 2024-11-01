# LunchDiscordBot

LunchBot is a Discord bot designed to fetch and post the daily and weekly lunch menus for a school cafeteria. The bot can automatically post the daily menu every morning at 9 AM and allows users to fetch the menu on demand using slash commands. Additionally, the bot includes a sleep mode feature to disable menu posting during periods like summer vacation.

## Features

- **Automatic Daily Menu Posting**: The bot automatically posts the daily lunch menu every morning at 9 AM. If the menu is not updated on the website, the bot will retry fetching and posting the menu up to 10 times with a 6-minute delay between attempts.
- **Weekly Menu Posting**: Allows users to fetch and post the entire week's lunch menu.
- **Sleep Mode**: Admins can enable or disable sleep mode to stop the bot from posting menus during vacations.
- **Slash Commands**:
  - `/lunch`: Fetches and posts the lunch menu for the current day.
  - `/weeklunch`: Fetches and posts the lunch menu for the entire week.
  - `/sleepmode`: Enables or disables sleep mode. Usage:
    - `/sleepmode enabled:true` - Enables sleep mode.
    - `/sleepmode enabled:false` - Disables sleep mode.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- A Discord bot token

### Setup

1. **Clone the repository**:

   ```sh
   git clone https://github.com/AnssiPeltola/LunchDiscordBot.git
   cd LunchDiscordBot

   ```

2. **Install dependencies**:

   ```sh
   npm install

   ```

3. **Create a .env file**: Create a .env file in the root directory of the project and add the following environment variables:

   ```sh
   TOKEN=your-discord-bot-token
   CLIENT_ID=your-discord-client-id
   GUILD_ID=your-discord-guild-id
   MENU_CHANNEL_ID=your-discord-menu-channel-id

   ```

4. **Create a config.json file**: Create a config.json file in the root directory of the project and add the following configuration:

   ```sh
   {
   "token": "your-discord-bot-token",
   "clientId": "your-discord-client-id",
   "guildId": "your-discord-guild-id",
   "menuChannelId": "your-discord-menu-channel-id"
   }

   ```

5. **Run the bot**:

   ```sh
   node bot.js

   ```
