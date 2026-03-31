import re
import io
import numpy as np
import easyocr
from flask import Flask, request, jsonify
from PIL import Image

app = Flask(__name__)
reader = easyocr.Reader(['en'], gpu=False, verbose=False)

STATUS_WORDS = {'completed', 'paid', 'successful', 'success', 'done', 'approved'}

NOISE_PATTERNS = [
    re.compile(r'\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?\b', re.I),  # times
    re.compile(r'\S+@\S+'),                                              # UPI IDs
    re.compile(r'\b\d{7,}\b'),                                           # phone/txn IDs
    re.compile(r'\b(?:19|20)\d{2}\b'),                                   # years
]

def is_noise(text):
    return any(p.search(text) for p in NOISE_PATTERNS)

def crop_center(img: Image.Image) -> Image.Image:
    """Crop vertical center 50% (25%–75%) — UPI amount always in the middle."""
    w, h = img.size
    top    = int(h * 0.25)
    bottom = int(h * 0.75)
    return img.crop((0, top, w, bottom))

def parse_amount(text: str):
    """Return numeric value if text is a clean payment amount, else None."""
    clean = re.sub(r'[₹₨]|Rs\.?|INR', '', text, flags=re.I).strip()
    clean = clean.replace(',', '').strip()

    m = re.fullmatch(r'(\d+(?:\.\d{1,2})?)', clean)
    if not m:
        return None

    val = round(float(m.group(1)))
    return val if 1 <= val <= 99999 else None


def extract_amount(texts: list):
    """
    PRIMARY  — number on the line directly above the status word.
    SECONDARY — first ₹-prefixed number anywhere in the text.
    """
    # PRIMARY
    for i, t in enumerate(texts):
        if t.strip().lower() in STATUS_WORDS:
            for j in range(i - 1, max(i - 5, -1), -1):
                candidate = texts[j].strip()
                if is_noise(candidate):
                    continue
                val = parse_amount(candidate)
                if val is not None:
                    return val
            return None  # status found but no valid number above

    # SECONDARY: ₹-prefixed number
    joined = ' '.join(texts)
    m = re.search(r'[₹₨]\s*(\d[\d,]*(?:\.\d{1,2})?)', joined)
    if m:
        val = round(float(m.group(1).replace(',', '')))
        if 1 <= val <= 99999:
            return val

    return None


@app.route('/', methods=['GET'])
def index():
    return jsonify({'service': 'DeliverGuard OCR', 'status': 'running'})


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/extract', methods=['POST'])
def extract():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file  = request.files['image']
    img   = Image.open(io.BytesIO(file.read())).convert('RGB')
    img   = crop_center(img)                          # crop to center 50%
    arr   = np.array(img)

    # paragraph=False keeps each text box separate — prevents digit merging
    # max(candidates) in extract_amount picks 120 over stray 2
    results = reader.readtext(arr, detail=0, paragraph=False)
    app.logger.info(f'[OCR] texts: {results}')

    amount = extract_amount(results)
    app.logger.info(f'[OCR] amount: {amount}')

    return jsonify({'amount': amount})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
