import pandas as pd
import preprocessor as pre
import pickle
import re


df = pd.read_csv('../data/test.csv')


# Handle emojis
with open('./Emoji_Dict.p', 'rb') as fp:
    Emoji_Dict = pickle.load(fp)

Emoji_Dict = {v: k for k, v in Emoji_Dict.items()}

def convert_emojis_to_word(text):
    for emot in Emoji_Dict:
        text = re.sub(r'('+emot+')', "_".join(Emoji_Dict[emot].replace(",","").replace(":","").split()), text)
    return text


# Tweet params (not removing emoji yet)
pre.set_options(pre.OPT.URL, 
				pre.OPT.MENTION, 
				pre.OPT.HASHTAG, 
				pre.OPT.RESERVED, 
				pre.OPT.NUMBER)


# Apply to dataframe
for i,v in enumerate(df['tweet_text']):
	if isinstance(v, str):
		df.loc[i,'tweet_text'] = convert_emojis_to_word(pre.clean(v))
		print(df.loc[i,'tweet_text'])
