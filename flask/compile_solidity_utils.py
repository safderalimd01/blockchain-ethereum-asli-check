import pickle
from web3 import Web3
from solc import compile_files, link_code


# web3.py instance
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
