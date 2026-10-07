import os
import urllib.parse
import re

public_new = set(os.listdir("public/new images"))
public_img = set(os.listdir("public/images"))

with open("src/data/driveSongsData.ts") as f:
    content = f.read()

paths = re.findall(r'"imagePath":\s*"([^"]+)"', content)
cover_paths = re.findall(r'"coverImage":\s*"([^"]+)"', content)
all_paths = set(paths + cover_paths)

print(f"Total unique image paths: {len(all_paths)}")
for p in sorted(all_paths):
    decoded = urllib.parse.unquote(p)
    clean = decoded.replace("/new images/", "").replace("/images/", "")
    found = False
    if "/new images/" in decoded or "/new%20images/" in p:
        found = clean in public_new
    elif "/images/" in decoded:
        found = clean in public_img
    status = "EXISTS" if found else "NOT FOUND"
    print(f"  [{status}] {p} (clean: '{clean}')")
