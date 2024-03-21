import os
import re
import requests
from urllib.parse import urljoin

# Base URL for relative paths
base_url = 'https://tembo.io'

# Compile the regex pattern to match Markdown links that contain the target paths
pattern = re.compile(r'\]\((/docs[^)]+|https://tembo.io/docs[^)]+)\)')

def find_files(directory):
    """Recursively yield file paths from the given directory."""
    for root, _, files in os.walk(directory):
        for file in files:
            yield os.path.join(root, file)

def extract_urls(file_path):
    """Extract matching URLs from the specified file."""
    urls = []
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        for line in file:
            urls.extend(pattern.findall(line))
    return urls

def check_url_status(url):
    """Check the HTTP status code of the URL."""
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        if response.status_code == 200:
            print(f"URL {url} is OK.")
        else:
            print(f"URL {url} returned status {response.status_code}")
    except requests.RequestException as e:
        print(f"Error checking URL {url}: {e}")

def main():
    # Find and check URLs in all files within the current directory and subdirectories
    for file_path in find_files('.'):
        for url_fragment in extract_urls(file_path):
            # Normalize URL (ensure it's a fully qualified URL)
            url = urljoin(base_url, url_fragment) if not url_fragment.startswith('http') else url_fragment
            check_url_status(url)

if __name__ == '__main__':
    main()
