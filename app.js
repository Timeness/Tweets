const axios = require("axios");
const { Bot } = require("grammy");

const BOT_TOKEN = "8040058187:AAEykWGMhrv9lWlFrj-W9rwPiPENI2ZuHXw";
const CHANNEL_ID = "-1002333484577";
const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAFZpyQEAAAAAp7k5DqPP65jx29YamyqM0NgsV%2FM%3D41Zh40EF5F7PQwU5iCZiybISIGntiuINEpW8BV0GP2cwwoqJh0";
const USERNAME = "cryptobeastreal";
const bot = new Bot(BOT_TOKEN);

let lastTweetId = null;

async function fetchLatestTweet() {
    const url = `https://api.twitter.com/2/tweets?username=${USERNAME}&max_results=1`;
    const headers = { Authorization: `Bearer ${BEARER_TOKEN}` };

    try {
        const response = await axios.get(url, { headers });
        const tweets = response.data.data;

        if (tweets && tweets.length > 0) {
            const latestTweet = tweets[0];
            if (latestTweet.id !== lastTweetId) {
                lastTweetId = latestTweet.id;
                await postToTelegram(latestTweet.text);
            }
        }
    } catch (error) {
        console.error("Error fetching tweet:", error);
    }
}

async function postToTelegram(message) {
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = { chat_id: CHANNEL_ID, text: message };

    try {
        await axios.post(telegramUrl, payload);
    } catch (error) {
        console.error("Error posting to Telegram:", error);
    }
}

setInterval(fetchLatestTweet, 60000);


bot.command("start", (ctx) => ctx.reply("Heya; I will post leatest tweets here."));
bot.command("fetch", async (ctx) => {
    await fetchLatestTweet();
    ctx.reply("Fetched latest tweets !");
});

bot.start();
