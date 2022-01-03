import ethers from 'ethers';
import chalk from 'chalk';
import dotenv from 'dotenv';
import inquirer from 'inquirer';

dotenv.config();

const chalkValue = chalk.blue.italic;
const chalkTransactionInfo = chalk.green;
const chalkWarning = chalk.hex('#FFA500');
const chalkToken = chalk.blue.bold.underline;
const formatEther = ethers.utils.formatEther;
const parseUnits = ethers.utils.parseUnits;
const formatUnits = ethers.utils.formatUnits;

const wss = process.env.ENDPOINT_WSS;
const mnemonic = process.env.WALLET_MNEMONIC;
const bnbAmount = process.env.AMOUNT_OF_BNB;
const exactTokens = process.env.EXACT_AMOUNT_TOKEN;
const bnbContract = process.env.TOKEN_BNB_CONTRACT;
const tokenContract = process.env.TOKEN_SALES_CONTRACT;
const routerContract = process.env.PANCAKE_ROUTER;
const address = process.env.WALLET_ADDRESS;
const gasLimit = process.env.GAS_LIMIT;
const gasPrice = parseUnits(`${process.env.GWEI}`, 'gwei');

const provider = new ethers.providers.WebSocketProvider(wss);
const wallet = new ethers.Wallet(mnemonic);
const account = wallet.connect(provider);

const router = new ethers.Contract(
  routerContract,
  [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  ],
  account
);

const buyExactTokensWithEth = async () => {
  let liquidityDetected = false;
  
  if(liquidityDetected) {
    console.log(chalkWarning('Compra já executada.'));
    return null;
  }

  try {
    liquidityDetected = true;

    const amountIn = parseUnits(`${bnbAmount}`, 'ether');
    const amountInTokens = parseUnits(`${exactTokens}`, 'ether');
    const amounts = await router.getAmountsOut(amountInTokens, [bnbContract, tokenContract]);
    const amountOut = amounts[0];
    const path = [bnbContract, tokenContract];

    console.log(chalk.green.inverse(` Iniciando compra \n`))

console.log('Dados da transação\n' +
chalkTransactionInfo(`Máximo BNB usado: ${chalkValue(formatEther(amountIn))} - ${chalkToken(bnbContract)}
Quantidade comprada: ${chalkValue(formatEther(amountOut))} - ${chalkToken(tokenContract)}
Carteira: ${chalkToken(address)}
gasLimit: ${chalkValue(gasLimit)}
gasPrice: ${chalkValue(formatUnits(gasPrice, 'gwei'))}
`));

    const tx = await router.swapETHForExactTokens(
      amountOut,
      path,
      address,
      Date.now() + 1000 * 60 * 5, //5 minutos
      {
        'gasLimit': gasLimit,
        'gasPrice': gasPrice,
        'nonce': null,
        'value': amountIn
      }
    );
    
    const receipt = await tx.wait();

    console.log(`Transacão concluida: https://${wss.includes('testnet') ? 'testnet.' : ''}bscscan.com/tx/${receipt.logs[1].transactionHash}`);
    
    setTimeout(() => process.exit(), 500);
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
      if(!answers.runAgain) return process.exit();
        liquidityDetected = false;

        console.log('= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =');
        console.log('Rodando novamente');
        console.log('= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =');

        buyExactTokensWithEth();
      }
    );
  }
}

export default buyExactTokensWithEth;
