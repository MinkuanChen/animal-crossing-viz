# -*- coding: utf-8 -*-
"""
Created on Mon Nov  1 18:28:00 2021

@author: chenm
"""
import os
# from dotenv import load_dotenv
# load_dotenv()
# load_dotenv(".env")

os.getcwd()

from datetime import datetime, date, timedelta
today = datetime.strftime(date.today(), "%Y%m%d")

import pandas as pd
import json

import demoji

import tweepy
from tweepy import OAuthHandler

consumer_key = os.getenv("CONSUMER_KEY")
consumer_secret = os.getenv("CONSUMER_SECRET")
access_token = os.getenv("ACCESS_TOKEN")
access_token_secret = os.getenv("ACCESS_TOKEN_SECRET")

auth = OAuthHandler()
auth.set_access_token()
api = tweepy.API(auth, wait_on_rate_limit=True)

search_words = "#AnimalCrossing"
number_of_tweets = 30000
# tweets = tweepy.Cursor(api.search_tweets, q=search_words, lang="en", include_entities=True, since_id=1456281131863740000, max_id=1456739836514020000, count=100).items(number_of_tweets)
tweets = tweepy.Cursor(api.search_tweets, q=search_words, lang="en", include_entities=True, since_id=1456281131863740000, max_id=1456529322420867073, count=100).items(number_of_tweets)

"""
for tweet in tweets:
    print(dir(tweet))
"""

#type(tweet) #tweepy.models.Status

"""
created_at : The time the status was posted.
id : The ID of the status.
id_str : The ID of the status as a string.
text : The text of the status.
entities : The parsed entities of the status such as hashtags, URLs etc.
source : The source of the status.
source_url : The URL of the source of the status.
in_reply_to_status_id : The ID of the status being replied to.
in_reply_to_status_id_str : The ID of the status being replied to in as a string.
in_reply_to_user_id : The ID of the user being replied to.
in_reply_to_user_id_str : The ID of the user being replied to as a string.
in_reply_to_screen_name : The screen name of the user being replied to
user : The User object of the poster of the status.
geo : The geo object of the status.
coordinates : The coordinates of the status.
place : The place of the status.
contributors : The contributors of the status.
is_quote_status : Indicates whether the status is a quoted status or not.
retweet_count : The number of retweets of the status.
favorite_count : The number of likes of the status.
favorited : Indicates whether the status has been favourited by the authenticated user or not.
retweeted : Indicates whether the status has been retweeted by the authenticated user or not.
possibly_sensitive : Indicates whether the status is sensitive or not.
lang : The language of the status.
"""

tweet_created_at = []
tweet_id = []
tweet_text = []
tweet_entities = []
tweet_source = []
tweet_source_url = []
tweet_in_reply_to_tweet_id = []
tweet_in_reply_to_user_id = []
tweet_in_reply_to_screen_name = []
tweet_user = []
tweet_user_id = []
tweet_user_screen_name = []
tweet_user_followers_count = []
tweet_user_following_count = []
tweet_user_verified = []
tweet_geo = []
tweet_coordinates = []
tweet_place = []
tweet_is_quote = []
tweet_retweet_count = []
tweet_favorite_count = []


curr_tweet=0
for tweet in tweets:
    print(curr_tweet)
    tweet_created_at.append(tweet.created_at)
    tweet_id.append(tweet.id_str)
    tweet_text.append(tweet.text)
    tweet_entities.append(tweet.entities)
    tweet_source.append(tweet.source)
    tweet_source_url.append(tweet.source_url)
    tweet_in_reply_to_tweet_id.append(tweet.in_reply_to_status_id)
    tweet_in_reply_to_user_id.append(tweet.in_reply_to_user_id)
    tweet_in_reply_to_screen_name.append(tweet.in_reply_to_screen_name)
    tweet_user.append(tweet.user)
    tweet_user_id.append(tweet.user._json["id_str"])
    tweet_user_screen_name.append(tweet.user._json["screen_name"])
    tweet_user_followers_count.append(tweet.user._json["followers_count"])
    tweet_user_following_count.append(tweet.user._json["friends_count"])
    tweet_user_verified.append(tweet.user._json["verified"])
    tweet_geo.append(tweet.geo)
    tweet_coordinates.append(tweet.coordinates)
    tweet_place.append(tweet.place)
    tweet_is_quote.append(tweet.contributors)
    tweet_retweet_count.append(tweet.retweet_count)
    tweet_favorite_count.append(tweet.favorite_count)
    curr_tweet+=1

df_tweets=pd.DataFrame({"tweet_created_at":tweet_created_at,
                        "tweet_id":tweet_id,
                        "tweet_text":tweet_text,
                        "tweet_entities":tweet_entities,
                        "tweet_source":tweet_source,
                        "tweet_source_url":tweet_source_url,
                        "tweet_in_reply_to_tweet_id":tweet_in_reply_to_tweet_id,
                        "tweet_in_reply_to_user_id":tweet_in_reply_to_user_id,
                        "tweet_in_reply_to_screen_name":tweet_in_reply_to_screen_name,
                        "tweet_user":tweet_user,
                        "tweet_user_id":tweet_user_id,
                        "tweet_user_screen_name":tweet_user_screen_name,
                        "tweet_user_followers_count":tweet_user_followers_count,
                        "tweet_user_following_count":tweet_user_following_count,
                        "tweet_user_verified":tweet_user_verified,
                        "tweet_geo":tweet_geo,
                        "tweet_coordinates":tweet_coordinates,
                        "tweet_place":tweet_place,
                        "tweet_is_quote":tweet_is_quote,
                        "tweet_retweet_count":tweet_retweet_count,
                        "tweet_favorite_count":tweet_favorite_count})



df_tweets.shape


df_tweets_original = df_tweets[~df_tweets.tweet_text.str.contains("RT")].reset_index(drop=True)
#df_tweets_original.drop(["tweet_entities", "tweet_user"], axis=1, inplace=True)

df_tweets_original.shape
df_tweets_original.to_csv("data/animal_crossing_tweets_original2_{}.csv".format(today), index=False)

#test demoji
#demoji.findall(df_tweets_original["tweet_text"][38])

