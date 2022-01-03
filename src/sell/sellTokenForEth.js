import ethers from 'ethers';
import chalk from 'chalk';
import inquirer from 'inquirer';
import dotenv from 'dotenv';

dotenv.config();

const wss = process.env.ENDPOINT_WSS;
const mnemonic = process.env.WALLET_MNEMONIC;
const bnbContract = process.env.TOKEN_BNB_CONTRACT;
const tokenContract = process.env.TOKEN_SALES_CONTRACT;
const routerContract = process.env.PANCAKE_ROUTER;
const address = process.env.WALLET_ADDRESS;
const slippage = process.env.SLIPPAGE;
const gasLimit = process.env.GAS_LIMIT;
const gasPrice = ethers.utils.parseUnits(`${process.env.GWEI}`, 'gwei');

const provider = new ethers.providers.WebSocketProvider(wss);
const wallet = new ethers.Wallet(mnemonic);
const account = wallet.connect(provider);

const chalkValue = chalk.blue.italic;
const chalkTransactionInfo = chalk.green;
const chalkToken = chalk.blue.bold.underline;
const formatEther = ethers.utils.formatEther;

const router = new ethers.Contract(
  routerContract,
  [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external',
  ],
  account
);

const balanceToken = new ethers.Contract(
  tokenContract,
  [{"constant": true,"inputs": [{"name": "_owner","type": "address"}],"name": "balanceOf","outputs": [{"name": "balance","type": "uint256"}],"type": "function"}],
  provider
);

const erc = new ethers.Contract(
  tokenContract,
  [
    "function approve(address _spender, uint256 _value) public returns (bool success)",
    'function balanceOf(address _owner) public returns (uint balance)'
  ],
  account
);

const sellTokenForEth = async () => {
  try {
    let balance = await balanceToken.balanceOf(address)
    balance = formatEther(balance);
    const sellAmount = ethers.utils.parseUnits(balance, "ether");
    console.log(`${chalkTransactionInfo('Pronto para vender:')} ${chalkValue(formatEther(sellAmount))}`);
    await erc.approve(routerContract, sellAmount);
    const amounts = await router.getAmountsOut(sellAmount, [tokenContract, bnbContract]);
    const amountOutMin = amounts[1].sub(amounts[1].div(slippage));
    
    console.log(
      chalk.green.inverse(`Iniciando Venda \n`)
      +
      `Vendendo Token

    ========================================================================================================
      ${chalkTransactionInfo('Quantidade vendida:')} ${chalkValue(formatEther(sellAmount))} - ${chalkToken(tokenContract)}
      ${chalkTransactionInfo('Quantidade mínima a receber:', chalkValue(formatEther(amountOutMin)), '-', chalkToken(bnbContract), '(BNB)')}
    ========================================================================================================
    `);

    console.log('Dados da transação');
    console.log(chalkTransactionInfo(`Quantidade Vendida: ${chalkValue(balance)} ${chalkToken(tokenContract)}`));
    console.log(chalkTransactionInfo(`Slippage usado: ${chalkValue(slippage)}`));
    console.log(chalkTransactionInfo(`Quantidade mínima a receber: ${chalkValue(formatEther(amountOutMin))} (BNB)`));
    console.log(chalkTransactionInfo(`Token vendido: ${chalkToken(tokenContract)}`));
    console.log(chalkTransactionInfo(`BNB: ${chalkToken(bnbContract)} (BNB)`));
    console.log(chalkTransactionInfo(`Carteira: ${chalkToken(address)}`));
    console.log(chalkTransactionInfo(`gasLimit: ${chalkValue(gasLimit)}`));
    console.log(chalkTransactionInfo(`gasPrice: ${chalkValue(ethers.utils.formatUnits(gasPrice, 'gwei'))}`));

    const tx = await router.swapExactTokensForETH(
      sellAmount,
      amountOutMin,
      [tokenContract, bnbContract],
      address,
      Date.now() + 1000 * 60 * 5, //5 minutos
      {
        'gasLimit': gasLimit,
        'gasPrice': gasPrice,
      }
    );
    
    const receipt = await tx.wait();
    console.log(`Transação recebida: https://${wss.includes('testnet') ? 'testnet.' : ''}bscscan.com/tx/${receipt.logs[1].transactionHash}`);
    setTimeout(() => {process.exit()}, 500);
  } catch(err) {
    let error = JSON.parse(JSON.stringify(err));
    
    console.error(error);

    inquirer.prompt([
      {
        type: 'confirm',
        name: 'runAgain',
        message: 'Deseja rodar o bot novamente?',
      },
    ])
    .then(answers => {
      if (answers.runAgain === true) {
        console.log('= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =');
        console.log('Rodando venda novamente.');
        console.log('= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =');
        sellTokenForEth();
      } else {
        process.exit();
      }
    });
  }
}

export default sellTokenForEth;
