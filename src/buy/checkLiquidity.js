import ethers from 'ethers';
import dotenv from 'dotenv';
import chalk from 'chalk';

import buyTokensWithExactEth from './buyTokensWithExactEth.js';
import buyTokenWithToken from './buyTokenWithToken.js';
import buyExactTokensWithEth from './buyExactTokensWithEth.js'

dotenv.config();

const wss = process.env.ENDPOINT_WSS;
const mnemonic = process.env.WALLET_MNEMONIC;
const bnbContract = process.env.TOKEN_BNB_CONTRACT;
const busdContract = process.env.TOKEN_BUSD_CONTRACT;
const tokenContract = process.env.TOKEN_SALES_CONTRACT;
const factoryContract = process.env.PANCAKE_FACTORY;
const bnbMinLiquidity = process.env.MIN_LIQUIDITY_BNB;
const busdMinLiquidity = process.env.MIN_LIQUIDITY_BUSD;

const provider = new ethers.providers.WebSocketProvider(wss);
const wallet = new ethers.Wallet(mnemonic);
const account = wallet.connect(provider);

const chalkValue = chalk.blue.italic;
const chalkTransactionInfo = chalk.green;
const chalkWarning = chalk.hex('#FFA500');
const chalkToken = chalk.blue.bold.underline;
const formatEther = ethers.utils.formatEther;

let jmlBnb = 0;
let jmlBusd = 0;


const factory = new ethers.Contract(
  factoryContract,
  [
    'event PairCreated(address indexed token0, address indexed token1, address pair, uint)',
    'function getPair(address tokenA, address tokenB) external view returns (address pair)',
  ],
  account
);

const erc = new ethers.Contract(
  bnbContract,
  [{"constant": true,"inputs": [{"name": "_owner","type": "address"}],"name": "balanceOf","outputs": [{"name": "balance","type": "uint256"}],"payable": false,"type": "function"}],
  account
);

const balanceToken = new ethers.Contract(
  busdContract,
  [{"constant": true,"inputs": [{"name": "_owner","type": "address"}],"name": "balanceOf","outputs": [{"name": "balance","type": "uint256"}],"type": "function"}],
  provider
);

const checkLiquidity = async (type) => {
  const pairAddressx = await factory.getPair(bnbContract, tokenContract);
  const pairAddressxBusd = await factory.getPair(busdContract, tokenContract);

  console.log(chalkTransactionInfo(`pairAddress: ${chalkToken(pairAddressx)}`));
  console.log(chalkTransactionInfo(`pairAddressBusd: ${chalkToken(pairAddressx)}`));

  const pairBNBvalue = await erc.balanceOf(pairAddressx);
  const pairBusdValue = await balanceToken.balanceOf(pairAddressxBusd);

  jmlBnb = await formatEther(pairBNBvalue);
  jmlBusd = await formatEther(pairBusdValue);

  console.log(chalkTransactionInfo(`\nValor da liquidez em BNB: ${chalkValue(jmlBnb)}`));
  console.log(chalkTransactionInfo(`Valor da liquidez em BUSD: ${chalkValue(jmlBusd)}\n`));

  if(parseFloat(jmlBnb) > parseFloat(bnbMinLiquidity) || parseFloat(jmlBusd) > parseFloat(busdMinLiquidity)) {
    setTimeout(() => {
      if (type === 'BNB para Token') buyTokensWithExactEth();
      if (type === 'Token para Token') buyTokenWithToken();
      if (type === 'BNB para Tokens Exatos') buyExactTokensWithEth();
    }, 500);
  } else {
    console.log(chalkWarning('Sem liquidez rodando novamente...'));
    return await checkLiquidity();
  }
}

export default checkLiquidity;
