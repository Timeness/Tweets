const axios = require("axios");
const { Bot } = require("grammy");

const BOT_TOKEN = "8040058187:AAEykWGMhrv9lW9rwPiPENI2ZuHXw";
const CHANNEL_ID = "-1002333484577";
const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAFZpyQEAAAAAp7k5DqPP65jx29YamyqM0NgsV%2FM%3D41Zh40EF5F7PQwU5iCZiybISIGntiuINEpW8BV0GP2cwwoqJh0";
const bot = new Bot(BOT_TOKEN);

let lastTweetId = null;

async function fetchUserIdByUsername(username) {
    const url = `https://api.twitter.com/2/users/by/username/${username}`;
    const headers = { Authorization: `Bearer ${BEARER_TOKEN}` };

    try {
        const response = await axios.get(url, { headers });
        return response.data.data.id;
    } catch (error) {
        throw new Error(`Error fetching user ID for @${username}: ${error.response?.data?.error || error.message}`);
    }
}

async function fetchLatestTweetByUserId(userId) {
    const url = `https://api.twitter.com/2/users/${userId}/tweets?max_results=1`;
    const headers = { Authorization: `Bearer ${BEARER_TOKEN}` };

    try {
        const response = await axios.get(url, { headers });
        return response.data.data;
    } catch (error) {
        throw new Error(`Error fetching tweets for user ID ${userId}: ${error.response?.data?.error || error.message}`);
    }
}

async function fetchLatestTweet() {
    try {
        const userId = await fetchUserIdByUsername("cryptobeastreal");
        const tweets = await fetchLatestTweetByUserId(userId);

        if (tweets && tweets.length > 0) {
            const latestTweet = tweets[0];
            if (latestTweet.id !== lastTweetId) {
                lastTweetId = latestTweet.id;
                await postToTelegram(latestTweet.text);
            }
        }
    } catch (error) {
        console.error("Error fetching latest tweet:", error.message);
    }
}

async function postToTelegram(message) {
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = { chat_id: CHANNEL_ID, text: message };

    try {
        await axios.post(telegramUrl, payload);
    } catch (error) {
        console.error("Error posting to Telegram:", error.message);
    }
}

bot.command("fetch", async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("Please provide a Twitter username. Example: /fetch TwitterHandle");
    }

    const username = args[1];

    try {
        const userId = await fetchUserIdByUsername(username);
        const tweets = await fetchLatestTweetByUserId(userId);

        if (tweets && tweets.length > 0) {
            ctx.reply(`Latest tweet from @${username}: ${tweets[0].text}`);
        } else {
            ctx.reply(`No tweets found for @${username}.`);
        }
    } catch (error) {
        ctx.reply(`Error: ${error.message}`);
    }
});

bot.command("start", (ctx) =>
    ctx.reply("Heya! I will post the latest tweets here. Use /fetch {username} to get the latest tweets from any user.")
);

setInterval(fetchLatestTweet, 60000);

bot.start();
