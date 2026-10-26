import argparse
import pandas as pd
import matplotlib.pyplot as plt
import requests


def main():
    parser = argparse.ArgumentParser(prog="report", description="Download sales data and plot a report.")
    parser.add_argument("url")
    parser.add_argument("--out", default="report.png")
    args = parser.parse_args()
    data = pd.read_csv(args.url)
    data.plot()
    plt.savefig(args.out)


if __name__ == "__main__":
    main()
