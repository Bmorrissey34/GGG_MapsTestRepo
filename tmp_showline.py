from pathlib import Path
text = Path("components/CampusMapView.js").read_text(encoding="utf-8")
line = next(l for l in text.splitlines() if "Scroll/pinch" in l)
print(repr(line))
