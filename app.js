const axios = require("axios");
const { Bot } = require("grammy");
const fetch = require("node-fetch");

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

bot.command("start", (ctx) => ctx.reply("Heya; I will post leatest tweets here use /fetch {username} to get the latest tweets."));

async function fetchLatestTweetByUsername(username) {
    const response = await fetch(`https://api.twitter.com/2/users/by/username/${username}/tweets`, {
        headers: {
            Authorization: `Bearer AAAAAAAAAAAAAAAAAAAAAFZpyQEAAAAAp7k5DqPP65jx29YamyqM0NgsV%2FM%3D41Zh40EF5F7PQwU5iCZiybISIGntiuINEpW8BV0GP2cwwoqJh0`,
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching tweets: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

bot.command("fetch", async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        await fetchLatestTweet();
        ctx.reply("Fetched latest tweets !");
        return ctx.reply("Please provide a Twitter username. Example: /fetch TwitterHandle");
    }

    const username = args[1];

    try {
        const tweets = await fetchLatestTweetByUsername(username);
        if (tweets.data && tweets.data.length > 0) {
            ctx.reply(`Latest tweet from @${username}: ${tweets.data[0].text}`);
        } else {
            ctx.reply(`No tweets found for @${username}.`);
        }
    } catch (error) {
        ctx.reply(`Error: ${error.message}`);
    }
});

bot.start();
