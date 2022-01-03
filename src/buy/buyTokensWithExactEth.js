import ethers from 'ethers';
import chalk from 'chalk';
import dotenv from 'dotenv';
import inquirer from 'inquirer';

dotenv.config();

const wss = process.env.ENDPOINT_WSS;
const mnemonic = process.env.WALLET_MNEMONIC;
const bnbAmount = process.env.AMOUNT_OF_BNB;
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
const chalkWarning = chalk.hex('#FFA500');
const chalkToken = chalk.blue.bold.underline;
const formatEther = ethers.utils.formatEther;

const router = new ethers.Contract(
  routerContract,
  [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function swapExactETHForTokens( uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  ],
  account
);

const buyTokensWithExactEth = async () => {
  let initialLiquidityDetected = false;
  if(initialLiquidityDetected === true) {
    console.log(chalkWarning('Processo de compra já executada.'));
    return null;
  }

  console.log('Pronto para compra');
  try {
    initialLiquidityDetected = true;

    let amountOutMin = 0;
    const amountIn = ethers.utils.parseUnits(`${bnbAmount}`, 'ether');
    if ( parseInt(slippage) !== 0 ){
      const amounts = await router.getAmountsOut(amountIn, [bnbContract, tokenContract]);
      amountOutMin = amounts[1].sub(amounts[1].div(`${slippage}`))
    }

    console.log()

    console.log(
      chalk.green.inverse(`Iniciando compra \n`)
      +
      `Comprando token

    ===================================================================================================
      ${chalkTransactionInfo('Quantidade comprada:', chalkValue((formatEther(amountIn)).toString()), '-', chalkToken(bnbContract), '(BNB)')}
      ${chalkTransactionInfo('Quantidade mínima a receber:')} ${chalkValue(amountOutMin.toString())} - ${chalkToken(tokenContract)}
    ===================================================================================================
    `);

    console.log('Dados da transação');
    console.log(chalkTransactionInfo(`Quantidade comprada: ${chalkValue(formatEther(amountIn))} - ${chalkToken(bnbContract)} (BNB)`));
    console.log(chalkTransactionInfo(`Slippage usado: ${chalkValue(slippage)}`));
    console.log(chalkTransactionInfo(`Quantidade mínima a receber: ${chalkValue(formatEther(amountOutMin))}`));
    console.log(chalkTransactionInfo(`Token de compra: ${chalkToken(bnbContract)}`));
    console.log(chalkTransactionInfo(`Token comprado: ${chalkToken(tokenContract)}`));
    console.log(chalkTransactionInfo(`Carteira: ${chalkToken(address)}`));
    console.log(chalkTransactionInfo(`gasLimit: ${chalkValue(gasLimit)}`));
    console.log(chalkTransactionInfo(`gasPrice: ${chalkValue(ethers.utils.formatUnits(gasPrice, 'gwei'))}`));

    const tx = await router.swapExactETHForTokens(
      amountOutMin,
      [bnbContract, tokenContract],
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
      if(answers.runAgain === true){
        console.log('= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =');
        console.log('Rodando novamente');
        console.log('= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =');
        initialLiquidityDetected = false;
        buyTokensWithExactEth();
      }else{
        process.exit();
      }
    });
  }
}

export default buyTokensWithExactEth;

// if ( parseInt(slippage) !== 0 ) {
//   setIntervalAsyncD( async () => {
//     const amounts = await router.getAmountsOut(amountIn, [bnbContract, tokenContract]);
//     amountOutMin = amounts[1].sub(amounts[1].div(`${slippage}`));
//     console.log(formatEther(amountIn));
//     console.log('valor comprado', formatEther(valorComprado[1]));
//     console.log('valor atual', formatEther(amounts[1]))
//     let v1 = (formatEther(valorComprado[1]) - formatEther(amounts[1])) / formatEther(amounts[1])
//     console.log(parseFloat(v1.toFixed(2)))
//   }, 2000)
// }
