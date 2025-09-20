from pathlib import Path
path = Path("components/legend.jsx")
text = path.read_text(encoding="utf-8")
text = text.replace('{open ? "?'?" : "+"}', '{open ? "\\u2212" : "+"}')
if '?' in text:
    text = text.replace('?"?"', '???')
path.write_text(text, encoding="utf-8")
