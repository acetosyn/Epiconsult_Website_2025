import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import jsbeautifier
import cssbeautifier

url = "https://epidiagnostics.com/"
output_dir = "epiconsult_assets"
os.makedirs(output_dir, exist_ok=True)

visited = set()

def save_html(page_url):
    """Download and prettify HTML page."""
    try:
        response = requests.get(page_url, timeout=10)
        if response.status_code != 200:
            print(f"❌ Failed {page_url} [{response.status_code}]")
            return None
        soup = BeautifulSoup(response.text, "html.parser")

        # Save prettified HTML
        parsed = urlparse(page_url)
        filename = parsed.path.strip("/")
        if not filename or filename.endswith("/"):
            filename = "index"
        if not filename.endswith(".html"):
            filename += ".html"

        filepath = os.path.join(output_dir, filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(soup.prettify())
        print(f"✅ Saved HTML: {page_url} -> {filepath}")

        return soup
    except Exception as e:
        print(f"⚠️ Error fetching {page_url}: {e}")
        return None

def crawl(start_url):
    domain = urlparse(start_url).netloc
    to_visit = [start_url]

    while to_visit:
        current = to_visit.pop()
        if current in visited:
            continue
        visited.add(current)

        soup = save_html(current)
        if soup is None:
            continue

        # Save CSS
        for css in soup.find_all("link", {"rel": "stylesheet"}):
            css_url = urljoin(current, css["href"])
            css_file = os.path.join(output_dir, os.path.basename(css["href"].split("?")[0]))
            try:
                r = requests.get(css_url, timeout=10)
                formatted_css = cssbeautifier.beautify(r.text)
                with open(css_file, "w", encoding="utf-8") as f:
                    f.write(formatted_css)
                print(f"   🎨 Downloaded CSS: {css_url}")
            except Exception as e:
                print(f"   ⚠️ Failed CSS {css_url}: {e}")

        # Save JS
        for js in soup.find_all("script", {"src": True}):
            js_url = urljoin(current, js["src"])
            js_file = os.path.join(output_dir, os.path.basename(js["src"].split("?")[0]))
            try:
                r = requests.get(js_url, timeout=10)
                formatted_js = jsbeautifier.beautify(r.text)
                with open(js_file, "w", encoding="utf-8") as f:
                    f.write(formatted_js)
                print(f"   ⚡ Downloaded JS: {js_url}")
            except Exception as e:
                print(f"   ⚠️ Failed JS {js_url}: {e}")

        # Find new links
        for a in soup.find_all("a", href=True):
            link = urljoin(current, a["href"])
            parsed = urlparse(link)
            if parsed.netloc == domain and link not in visited:
                if any(link.endswith(ext) for ext in [".html", "/", ""]):
                    to_visit.append(link)

if __name__ == "__main__":
    crawl(url)
