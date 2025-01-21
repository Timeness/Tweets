import tweepy
import json
import time
from pyrogram import Client, filters
import threading

consumer_key = 'Hoz7kYZlx3spHpZQWYwzlxyBf'
consumer_secret = 'FBEL5LdThweat35Kd2OFp5QxObVMYGiTrAg9N32zIZZHA6TyHx'
access_token = '1871540797289721856-x34bRv6Aku1rLByWn02fi9HIOUC9d0'
access_token_secret = 'TrM6zVfWzQZb8ZsGIFq8yexaOV4YhfbAMPS4uaTIpThpn'
telegram_token = '8040058187:AAE2WAunUPqmbUxEL7oAM3kWifBrPIpBVcM'
channel_id = '-1002333484577'
api_id = '29400566'
api_hash = '8fd30dc496aea7c14cf675f59b74ec6f'

auth = tweepy.OAuth1UserHandler(consumer_key, consumer_secret, access_token, access_token_secret)
api = tweepy.API(auth)
app = Client(name="TWEET_BOT", api_id=api_id, api_hash=api_hash, bot_token=telegram_token)

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

def fetch_latest_tweet(username):
    try:
        tweets = api.user_timeline(screen_name=username, count=1, tweet_mode='extended')
        if tweets:
            tweet = tweets[0].full_text
            return tweet
        return None
    except Exception as e:
        print(f"Error fetching tweets for {username}: {e}")
        return None

def send_to_telegram(tweet):
    try:
        app.send_message(channel_id, tweet)
    except Exception as e:
        print(f"Error sending message to Telegram: {e}")

def check_tweets():
    while True:
        for username in usernames:
            tweet = fetch_latest_tweet(username)
            if tweet:
                send_to_telegram(f"New tweet from @{username}: {tweet}")
        time.sleep(120)

@app.on_message(filters.command("add"))
async def add(update, _):
    username = _.text.split()[1] if len(_.text.split()) > 1 else None
    if username and username not in usernames:
        usernames.append(username)
        save_usernames()
        await _.reply(f"Username @{username} added successfully.")
    else:
        await _.reply("Invalid username or username already added.")

@app.on_message(filters.command("fetch"))
async def fetch(update, _):
    username = _.text.split()[1] if len(_.text.split()) > 1 else None
    if username:
        tweet = fetch_latest_tweet(username)
        if tweet:
            await _.reply(f"Latest tweet from @{username}: {tweet}")
        else:
            await _.reply(f"No tweets found for @{username}.")
    else:
        await _.reply("Please provide a valid username.")

@app.on_message(filters.command("list"))
async def list_users(update, _):
    if usernames:
        await _.reply("Added usernames:\n" + "\n".join([f"@{user}" for user in usernames]))
    else:
        await _.reply("No usernames have been added yet.")

@app.on_message(filters.command("start"))
async def start(update, _):
    await _.reply("Tweet Bot is running! You can add users with /add <username>, fetch latest tweets with /fetch <username>, or list added users with /list.")

tweet_checking_thread = threading.Thread(target=check_tweets, daemon=True)
tweet_checking_thread.start()

app.run()
