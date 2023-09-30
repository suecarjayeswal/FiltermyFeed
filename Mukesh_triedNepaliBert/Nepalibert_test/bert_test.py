from transformers import BertTokenizer

vocab_file_dir = './NepaliBERT/' 
tokenizer = BertTokenizer.from_pretrained(vocab_file_dir,
                                        strip_accents=False,
                                         clean_text=False )

from transformers import BertForMaskedLM
model = BertForMaskedLM.from_pretrained('./NepaliBERT')

from transformers import pipeline

fill_mask = pipeline(
    "fill-mask",
    model=model,
    tokenizer=tokenizer
)

res = fill_mask('तैले [MASK] खोजेको हो?')
print(res)