import os
import subprocess

def download_dataset():
    if not os.path.exists("data"):
        os.makedirs("data")

    if len(os.listdir("data")) > 0:
        print("Dataset already exists")
        return

    print("Downloading dataset...")
    subprocess.run([
        "kaggle",
        "datasets",
        "download",
        "-d",
        "ealaxi/paysim1",
        "-p",
        "data",
        "--unzip"
    ])
    print("Download complete")

if __name__ == "__main__":
    download_dataset()