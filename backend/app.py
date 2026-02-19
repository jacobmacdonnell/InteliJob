import sys
import time
import threading
import webbrowser
from pathlib import Path

# Add the backend directory to sys.path if needed
sys.path.insert(0, str(Path(__file__).parent))

import uvicorn
from main import app


def open_browser(port: int):
    # Wait a bit for the server to start
    time.sleep(1.5)
    url = f"http://localhost:{port}"
    print(f"Opening browser to {url}")
    webbrowser.open(url)


if __name__ == "__main__":
    port = 8000
    # Start the browser in a background thread
    threading.Thread(target=open_browser, args=(port,), daemon=True).start()

    print(f"Starting InteliJob server on port {port}...")
    # Run the server on the main thread
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
