import os
import urllib.request
import re

# Base Directory
base_dir = "/home/vuongductien/Tài liệu/quotation-tool-20260716T062626Z-1-001/quotation-tool"

# Create directories
dirs = [
    "libs/sortable",
    "libs/font-awesome/css",
    "libs/font-awesome/webfonts",
    "libs/fonts"
]

for d in dirs:
    path = os.path.join(base_dir, d)
    os.makedirs(path, exist_ok=True)
    print(f"Created directory: {path}")

def download_file(url, dest):
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        with urllib.request.urlopen(req) as response:
            with open(dest, 'wb') as f:
                f.write(response.read())
        print(f"Successfully downloaded: {url} -> {dest}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

# 1. Download SortableJS
sortable_url = "https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"
sortable_dest = os.path.join(base_dir, "libs/sortable/Sortable.min.js")
download_file(sortable_url, sortable_dest)

# 2. Download FontAwesome CSS
fa_css_url = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
fa_css_dest = os.path.join(base_dir, "libs/font-awesome/css/all.min.css")
download_file(fa_css_url, fa_css_dest)

# Download FontAwesome Webfonts
fa_webfonts = [
    "fa-solid-900.woff2",
    "fa-solid-900.woff",
    "fa-brands-400.woff2",
    "fa-brands-400.woff",
    "fa-regular-400.woff2",
    "fa-regular-400.woff"
]
for font in fa_webfonts:
    font_url = f"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/{font}"
    font_dest = os.path.join(base_dir, f"libs/font-awesome/webfonts/{font}")
    download_file(font_url, font_dest)

# 3. Download Google Fonts (Be Vietnam Pro)
# We fetch the CSS using a Chrome User-Agent to get woff2 format links
google_fonts_url = "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
try:
    req = urllib.request.Request(
        google_fonts_url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    )
    with urllib.request.urlopen(req) as response:
        css_content = response.read().decode('utf-8')
    
    # Parse font URLs from CSS content: url(https://...)
    urls = re.findall(r'url\((https://[^)]+)\)', css_content)
    
    # Download each font and replace in CSS
    for idx, font_url in enumerate(urls):
        # Generate local filename
        filename = f"be-vietnam-pro-font-{idx}.woff2"
        local_path = os.path.join(base_dir, "libs/fonts", filename)
        
        # Download the woff2 file
        download_file(font_url, local_path)
        
        # Replace remote URL with local path in CSS
        css_content = css_content.replace(font_url, filename)
    
    # Save the updated CSS file locally
    css_dest = os.path.join(base_dir, "libs/fonts/be-vietnam-pro.css")
    with open(css_dest, "w", encoding="utf-8") as f:
        f.write(css_content)
    print("Google Fonts processed successfully.")
except Exception as e:
    print(f"Error processing Google Fonts: {e}")
