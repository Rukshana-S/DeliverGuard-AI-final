import sys
import re
import io
import json
import numpy as np
import easyocr
from PIL import Image

STATUS_WORDS = {'completed', 'paid', 'successful', 'success', 'done', 'approved'}

NOISE_PATTERNS = [
    re.compile(r'\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?\b', re.I),
    re.compile(r'\S+@\S+'),
    re.compile(r'\b\d{7,}\b'),
    re.compile(r'\b(?:19|20)\d{2}\b'),
]

def is_noise(text):
    return any(p.search(text) for p in NOISE_PATTERNS)

def crop_center(img):
    w, h = img.size
    return img.crop((0, int(h * 0.15), w, int(h * 0.85)))

def parse_amount(text):
    clean = re.sub(r'[₹₨]|Rs\.?|INR', '', text, flags=re.I).strip().replace(',', '')
    m = re.fullmatch(r'(\d+(?:\.\d{1,2})?)', clean)
    if not m:
        return None
    val = round(float(m.group(1)))
    return val if 1 <= val <= 5000 else None

def extract_amount(texts):
    for i, t in enumerate(texts):
        if t.strip().lower() in STATUS_WORDS:
            candidates = []
            for j in range(i - 1, max(i - 5, -1), -1):
                candidate = texts[j].strip()
                if is_noise(candidate):
                    continue
                val = parse_amount(candidate)
                if val is not None:
                    candidates.append(val)
            return max(candidates) if candidates else None

    joined = ' '.join(texts)
    m = re.search(r'[₹₨]\s*(\d[\d,]*(?:\.\d{1,2})?)', joined)
    if m:
        val = round(float(m.group(1).replace(',', '')))
        if 1 <= val <= 5000:
            return val

    return None

if __name__ == '__main__':
    image_path = sys.argv[1]
    reader = easyocr.Reader(['en'], gpu=False, verbose=False)
    img = Image.open(image_path).convert('RGB')
    img = crop_center(img)
    arr = np.array(img)
    texts = reader.readtext(arr, detail=0, paragraph=False)
    sys.stderr.write(f'[OCR] texts: {texts}\n')
    amount = extract_amount(texts)
    sys.stderr.write(f'[OCR] amount: {amount}\n')
    print(json.dumps({'amount': amount}))
