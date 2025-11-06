import Web3 from 'web3';

export const BLOCKDAG_RPC_URL = 'https://ide.awakening.bdagscan.com/';

export const getWeb3 = () => {
  const web3 = new Web3(BLOCKDAG_RPC_URL);
  return web3;
};

export const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  } else {
    throw new Error('Please install MetaMask!');
  }
};

export const getBlockchainStatus = async () => {
  try {
    const web3 = getWeb3();
    const blockNumber = await web3.eth.getBlockNumber();
    const gasPrice = await web3.eth.getGasPrice();
    
    return {
      blockNumber: blockNumber.toString(),
      gasPrice: web3.utils.fromWei(gasPrice.toString(), 'gwei'),
      connected: true,
    };
  } catch (error) {
    console.error('Error getting blockchain status:', error);
    return {
      blockNumber: '0',
      gasPrice: '0',
      connected: false,
    };
  }
};

export const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};
