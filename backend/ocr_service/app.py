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

OCR_FIX = str.maketrans('rRuUlLoOsSgGqQiIzZ', '330011005566009911')

def fix_ocr(text: str) -> str:
    """Fix common OCR misreads in numeric strings."""
    return text.translate(OCR_FIX)

def parse_amount(text: str):
    """Return numeric value if text is a clean payment amount, else None."""
    clean = re.sub(r'^[₹₨RrBb8&]|Rs\.?|INR', '', text, flags=re.I).strip()
    clean = fix_ocr(clean).replace(',', '').strip()

    m = re.fullmatch(r'(\d+(?:\.\d{1,2})?)', clean)
    if not m:
        return None

    val = round(float(m.group(1)))
    return val if 10 <= val <= 99999 else None


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
            break  # status found, fall through to secondary

    # SECONDARY: ₹-prefixed number
    joined = ' '.join(texts)
    m = re.search(r'[₹₨]\s*(\d[\d,]*(?:\.\d{1,2})?)', joined)
    if m:
        val = round(float(m.group(1).replace(',', '')))
        if 10 <= val <= 99999:
            return val

    # TERTIARY: scan every text with OCR fix, pick largest valid amount
    candidates = []
    for t in texts:
        if is_noise(t):
            continue
        val = parse_amount(t)
        if val is not None:
            candidates.append(val)
    return max(candidates) if candidates else None


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
    arr   = np.array(img)

    # paragraph=False keeps each text box separate — prevents digit merging
    # max(candidates) in extract_amount picks 120 over stray 2
    results = reader.readtext(arr, detail=0, paragraph=False)
    print(f'[OCR TEXTS]: {results}', flush=True)

    amount = extract_amount(results)
    print(f'[OCR AMOUNT]: {amount}', flush=True)

    return jsonify({'amount': amount, 'debug_texts': results})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
