import pandas as pd
import preprocessor as pre

df = pd.read_csv('../data/test.csv')

pre.set_options(pre.OPT.URL, 
				pre.OPT.MENTION, 
				pre.OPT.HASHTAG, 
				pre.OPT.RESERVED, 
				pre.OPT.NUMBER)

for i,v in enumerate(df['tweet_text']):
	if isinstance(v, str):
		print(pre.clean(v))
		df.loc[i,'tweet_text'] = pre.clean(v)

print(df)
