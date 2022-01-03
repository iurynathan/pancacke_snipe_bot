import express from 'express';
import chalk from 'chalk';
import dotenv from 'dotenv';
import inquirer from 'inquirer';

import sellTokenForEth from './sell/sellTokenForEth.js';
import checkLiquidity from './buy/checkLiquidity.js';

const app = express();
dotenv.config();

const chalkToken = chalk.blue.bold.underline;
const chalkTransactionInfo = chalk.green;

inquirer.prompt(
  [
    {
      name: "snipe_type",
      type: "list",
      message: "O que deseja executar?",
      choices: ["BNB para Token", "BNB para Tokens Exatos", "Token para Token", "Token para BNB"],
    },
  ]
).then(async (answer) => {
  console.log(answer.snipe_type);
  if (answer.snipe_type === 'BNB para Token') {
    const PORT = 5002;
    app.listen(
      PORT,
      console.log(`
Verificando liquidez${chalkTransactionInfo(`
BNB: ${chalkToken(process.env.TOKEN_BNB_CONTRACT)}
BUSD: ${chalkToken(process.env.TOKEN_BUSD_CONTRACT)}`)}
`)
    );
    await checkLiquidity(answer.snipe_type);
  }
  if (answer.snipe_type === 'BNB para Tokens Exatos') {
    const PORT = 5002;
    app.listen(
      PORT,
      console.log(`
Verificando liquidez${chalkTransactionInfo(`
BNB: ${chalkToken(process.env.TOKEN_BNB_CONTRACT)}
BUSD: ${chalkToken(process.env.TOKEN_BUSD_CONTRACT)}`)}
`)
    );
    await checkLiquidity(answer.snipe_type);
  }
  if (answer.snipe_type === 'Token para Token') {
    const PORT = 5002;
    app.listen(
      PORT,
      console.log(chalkTransactionInfo(`Venda do token: ${chalkToken(process.env.TOKEN_SALES_CONTRACT)}`))
    );
    await checkLiquidity(answer.snipe_type);
  }
  if (answer.snipe_type === 'Token para BNB') {
    const PORT = 5002;
    app.listen(
      PORT, console.log(chalkTransactionInfo(`Venda do token: ${chalkToken(process.env.TOKEN_SALES_CONTRACT)}`))
    ); 
    await sellTokenForEth();
  }
});
