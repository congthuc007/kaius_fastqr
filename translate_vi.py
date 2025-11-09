import re
import time
from pathlib import Path
from googletrans import Translator

path = Path('components/language-provider.tsx')
text = path.read_text(encoding='utf-8')

def extract_block(label):
    search = f"{label}: "
    start = text.index(search)
    brace_start = text.index('{', start)
    depth = 1
    i = brace_start + 1
    while depth > 0 and i < len(text):
        ch = text[i]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
        i += 1
    return brace_start, i

en_start, en_end = extract_block('en')
en_block = text[en_start+1:en_end-1]
pattern = re.compile(r'"([^"]+)":\s+"([^"]*)"')
entries = pattern.findall(en_block)

translator = Translator()
translated = {}

def mask_placeholders(value):
    placeholders = []
    def repl(match):
        idx = len(placeholders)
        placeholders.append(match.group(0))
        return f"__PH_{idx}__"
    masked = re.sub(r'\{[^}]+\}', repl, value)
    return masked, placeholders

def unmask(value, placeholders):
    result = value
    for idx, placeholder in enumerate(placeholders):
        result = result.replace(f"__PH_{idx}__", placeholder)
    return result

for key, value in entries:
    masked, placeholders = mask_placeholders(value)
    if key in translated:
        continue
    attempt = 0
    while attempt < 3:
        try:
            trans = translator.translate(masked, src='en', dest='vi')
            translated_text = unmask(trans.text, placeholders)
            break
        except Exception:
            translated_text = value
            attempt += 1
            time.sleep(0.5)
    translated[key] = translated_text
    time.sleep(0.15)

vi_start, vi_end = extract_block('vi')
vi_block = text[vi_start:vi_end]

def replace_match(match):
    key = match.group(1)
    if key in translated:
        value = translated[key].replace('"', '\\"')
        return f'"{key}": "{value}"'
    return match.group(0)

updated_vi = pattern.sub(replace_match, vi_block)
new_text = text[:vi_start] + updated_vi + text[vi_end:]
path.write_text(new_text, encoding='utf-8')
