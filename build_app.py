import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
BACKEND = ROOT / "backend"

def run_cmd(cmd, cwd):
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, text=True)
    if result.returncode != 0:
        print(f"Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)

def main():
    print("=== Building React Frontend ===")
    npm_bin = "npm.cmd" if os.name == "nt" else "npm"
    run_cmd([npm_bin, "run", "build"], cwd=ROOT)
    
    print("\n=== Installing PyInstaller ===")
    run_cmd([sys.executable, "-m", "pip", "install", "pyinstaller"], cwd=ROOT)
    
    print("\n=== Bundling with PyInstaller ===")
    
    # We use a path separator based on OS for PyInstaller's --add-data
    separator = ";" if os.name == "nt" else ":"
    
    # Add dist/ built by vite.
    add_dist = f"{ROOT / 'dist'}{separator}dist"
    
    # Add certs.json.
    add_certs = f"{BACKEND / 'certs.json'}{separator}."
    
    pyinstaller_cmd = [
        sys.executable, "-m", "PyInstaller",
        "--name", "InteliJob",
        "--noconfirm", # Overwrite output if it exists
        "--onefile",   # Make a single executable
        "--add-data", add_dist,
        "--add-data", add_certs,
        str(BACKEND / "app.py")
    ]
    
    run_cmd(pyinstaller_cmd, cwd=ROOT)
    
    print("\n=== Build Complete ===")
    print(f"Executable can be found in: {ROOT / 'dist' / 'InteliJob'}")

if __name__ == "__main__":
    main()
