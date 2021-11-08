# -*- coding: utf-8 -*-
"""
Created on Sat Nov  6 12:03:23 2021

@author: chenm
"""
import string
import re
import pandas as pd
import numpy as np
import json
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn import manifold

import nltk # pip install nltk
from nltk.corpus import stopwords # nltk.download('stopwords')
from nltk.stem.porter import PorterStemmer

import spacy # pip install spacy

from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import gensim
from gensim.models import word2vec  #pip install word2vec

from wordcloud import WordCloud  #pip install wordcloud
from textblob import TextBlob  #Sentiment Analysis - pip install textblob

import warnings
warnings.filterwarnings("ignore")

from collections import Counter

import demoji

df_tweets = pd.read_csv("../datasets/animal_crossing_tweets_original_20211030_to_20211105.csv")
df_tweets.shape
df_tweets_original = df_tweets[~df_tweets.tweet_text.str.contains("RT")].reset_index(drop=True)
df_tweets_original.shape

### count frequency for each emoji in the corpus 
tweet_emojis = []
tweet_emojis.append(df_tweets_original["tweet_text"].apply(lambda x: demoji.findall(x)))
df_tweet_emojis = pd.DataFrame(tweet_emojis)
df_tweet_emojis_transposed = df_tweet_emojis.T
df_tweet_emojis_transposed = df_tweet_emojis_transposed[df_tweet_emojis_transposed["tweet_text"]!={}]

df_tweet_emojis_transposed.rename(columns={"tweet_text":"tweet_emojis"}, inplace=True)

df_tweet_emojis_transposed.to_csv("../datasets/tweet_emojis.csv")

#Remove urls
df_tweets_original.tweet_text = df_tweets_original.tweet_text.apply(lambda x: re.sub(r"http\S+", "", x))
df_tweets_original.tweet_text.apply(lambda x: re.sub(r"www\.[a-z]?\.?(com)+|[a-z]+\.(com)", "", x))

#Remove placeholders
df_tweets_original.tweet_text = df_tweets_original.tweet_text.apply(lambda x: re.sub(r"{link}", "", x))
df_tweets_original.tweet_text = df_tweets_original.tweet_text.apply(lambda x: re.sub(r"\[video\]", "", x))

#Remove HTML reference characters
df_tweets_original.tweet_text = df_tweets_original.tweet_text.apply(lambda x: re.sub(r"&[a-z]+;", "", x))

#Remove all entities including hastags and mentions
def strip_all_entities(text):
    entity_prefixes = ["@","#"]
    for separator in  string.punctuation:
        if separator not in entity_prefixes :
            text = text.replace(separator," ")
    words = []
    for word in text.split():
        word = word.strip()
        if word:
            if word[0] not in entity_prefixes:
                words.append(word)
    return " ".join(words)

df_tweets_original["tweet_text"] = df_tweets_original["tweet_text"].apply(lambda x: strip_all_entities(x))

#Convert to lowercase
df_tweets_original.loc[:,"tweet_text"] = df_tweets_original.tweet_text.apply(lambda x: x.lower())

#Remove chars that are not letters or numbers
regex = re.compile(r"\W+")
df_tweets_original.loc[:,"tweet_text"] = df_tweets_original.tweet_text.apply(lambda x: regex.sub(" ",x))

#Remove stop words
stops = set(stopwords.words("english")) #stops
stops = stops.union(["I"])

df_tweets_original.loc[:,"tweet_text"] = df_tweets_original["tweet_text"].apply(lambda x: x.split(" ")) 
df_tweets_original.loc[:,"tweet_text"] = df_tweets_original["tweet_text"].apply(lambda x: [word for word in x if word not in stops])


# Stem
snowball = nltk.stem.SnowballStemmer("english")
df_tweets_original["tweet_text"] = df_tweets_original["tweet_text"].apply(lambda x: [snowball.stem(word) for word in x] )
df_tweets_original["tweet_text"] = df_tweets_original["tweet_text"].apply(lambda x: [snowball.stem(word) for word in x] )


df_tweets_original.head()


def build_corpus(data):
    "Creates a list of lists containing words from each sentence"
    corpus = []
    for col in ['tweet_text']:
        for sentence in data[col].iteritems():
            corpus.append(sentence[1])
            
    return corpus

corpus = build_corpus(df_tweets_original)
print("Corpus length:",len(corpus))      
corpus[:3]

len(corpus)

### count word frequency for each word in the corpus 
word_list = []
for document in corpus:
    for word in document:
        word_list.append(word)
word_list = list(filter(None, word_list))
len(word_list)        

unique_word_list = np.unique(np.array(word_list)).tolist()
len(unique_word_list)

unique_word_freq = Counter(word_list)
len(unique_word_freq)

unique_word_freq_dict = {"words": []}
for key,value in unique_word_freq.items():
    unique_word_freq_dict["words"].append({"word": key, "count": value})

unique_word_freq_file = open("../datasets/tweet_text_word_frequency.json", "w")
json.dump(unique_word_freq_dict, unique_word_freq_file)
unique_word_freq_file.close()

### count frequency for each hashtag in the corpus



### sentiment analysis
tweet_texts = df_tweets.tweet_text.values

all_polarity = [TextBlob(blobs).sentiment.polarity for blobs in tweet_texts]
df_tweets["polarity"]=all_polarity

df_tweets["sentiment"] = np.where(df_tweets["polarity"]>=0.,"Positive","Negative")

df_tweets_sentiments = df_tweets.drop(columns=['tweet_entities',
       'tweet_source', 'tweet_source_url', 'tweet_in_reply_to_tweet_id',
       'tweet_in_reply_to_user_id', 'tweet_in_reply_to_screen_name', 'tweet_geo', 'tweet_coordinates', 'tweet_place', 'tweet_is_quote'], axis=1)

df_tweets_sentiments = df_tweets.drop(columns=['tweet_geo', 'tweet_coordinates', 'tweet_place', 'tweet_is_quote'], axis=1)

df_tweets_sentiments.to_csv("../datasets/tweet_sentiments.csv", index=False)
