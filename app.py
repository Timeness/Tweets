import tweepy
import json
import time
from pyrogram import Client, filters
import asyncio

consumer_key = 'Hoz7kYZlx3spHpZQWYwzlxyBf'
consumer_secret = 'FBEL5LdThweat35Kd2OFp5QxObVMYGiTrAg9N32zIZZHA6TyHx'
access_token = '1871540797289721856-x34bRv6Aku1rLByWn02fi9HIOUC9d0'
access_token_secret = 'TrM6zVfWzQZb8ZsGIFq8yexaOV4YhfbAMPS4uaTIpThpn'
telegram_token = '8040058187:AAHyF6N5GoG4mJqvxBbSSG3hfuRdd3'
channel_id = '-1002333484577'

auth = tweepy.OAuth1UserHandler(consumer_key, consumer_secret, access_token, access_token_secret)
api = tweepy.API(auth)
app = Client("TWEET_BOT", bot_token=telegram_token)

def load_usernames():
    try:
        with open('usernames.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_usernames():
    with open('usernames.json', 'w') as f:
        json.dump(usernames, f)

usernames = load_usernames()

async def fetch_latest_tweet(username):
    try:
        tweets = api.user_timeline(screen_name=username, count=1, tweet_mode='extended')
        if tweets:
            tweet = tweets[0].full_text
            return tweet
        return None
    except Exception as e:
        print(f"Error fetching tweets for {username}: {e}")
        return None

async def send_to_telegram(tweet):
    try:
        await app.send_message(channel_id, tweet)
    except Exception as e:
        print(f"Error sending message to Telegram: {e}")

async def check_tweets():
    while True:
        for username in usernames:
            tweet = await fetch_latest_tweet(username)
            if tweet:
                await send_to_telegram(f"New tweet from @{username}: {tweet}")
        await asyncio.sleep(120)

@app.on_message(filters.command("add"))
async def add(update, _):
    username = update.text.split()[1] if len(update.text.split()) > 1 else None
    if username and username not in usernames:
        usernames.append(username)
        save_usernames()
        await update.reply(f"Username @{username} added successfully.")
    else:
        await update.reply("Invalid username or username already added.")

@app.on_message(filters.command("fetch"))
async def fetch(update, _):
    username = update.text.split()[1] if len(update.text.split()) > 1 else None
    if username:
        tweet = await fetch_latest_tweet(username)
        if tweet:
            await update.reply(f"Latest tweet from @{username}: {tweet}")
        else:
            await update.reply(f"No tweets found for @{username}.")
    else:
        await update.reply("Please provide a valid username.")

@app.on_message(filters.command("list"))
async def list_users(update, _):
    if usernames:
        await update.reply("Added usernames:\n" + "\n".join([f"@{user}" for user in usernames]))
    else:
        await update.reply("No usernames have been added yet.")

async def main():
    asyncio.create_task(check_tweets())
    await app.start()

if __name__ == "__main__":
    asyncio.run(main())
