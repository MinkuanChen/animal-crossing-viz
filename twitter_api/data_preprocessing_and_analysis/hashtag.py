import collections
import pandas as pd
import collections
import ast
import csv


df = pd.read_csv('../data/animal_crossing_tweets_original2_20211107.csv')


d = collections.defaultdict(int)
for i in df['tweet_entities']:
	tmp = ast.literal_eval(i)
	if tmp['hashtags']:
		for j in tmp['hashtags']:
			d[j['text']] += 1

with open('../data/hashtags.csv', 'w') as csv_file:  
    writer = csv.writer(csv_file)
	# writer.writerow(['hashtag', 'frequency'])
    for key, value in d.items():
       writer.writerow([key, value])