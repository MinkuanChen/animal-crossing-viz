import pandas as pd
from datetime import datetime, timedelta
from time import gmtime, strftime



df = pd.read_csv("./animal_crossing_tweets_original2_20211107.csv")

# print(strftime("%Y-%m-%d %H:%M:%S+00:00", gmtime()))

df['tweet_created_at'] =pd.to_datetime(df.tweet_created_at)



df =  df.sort_values(by='tweet_created_at', ascending=False)
# print(df)
# print(df['tweet_created_at'][0], df['tweet_created_at'][1])
# print(df['tweet_created_at'][0] > df['tweet_created_at'][1])

d = {}

for idx, row in df.iterrows():
	end = row['tweet_created_at'] - timedelta(minutes=1)
	count = 0
	for i, r in df.iloc[idx:].iterrows():

		if r['tweet_created_at'] >= end:
			count += 1
		else:
			break

	date = str(row['tweet_created_at'])
	date = date.split("'")[0]
	d[date] = count
	# if idx == 10:
	# 	break

new_df = pd.DataFrame(d.items(), columns=['date', 'volume'])

# new_df.to_csv('./volume_data.csv')
