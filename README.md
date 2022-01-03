
# Índice
* [Notas Importantes](#OBSERVAÇÕES-IMPORTANTES-ANTES-DE-RODAR-O-BOT)
* [Update](#UPDATES)
* [Setup](#COMO-RODAR)
* [Possiveis Problemas](#POSSIVEIS-PROBLEMAS)

## OBSERVAÇÕES IMPORTANTES ANTES DE RODAR O BOT

## UPDATES

## COMO RODAR
1. Clone o repositório.
2. <code>$ npm install ou yarn</code> para instalar as dependências.
3. configure seu <code>.env</code> com está explicação: 

```
TOKEN_BNB_CONTRACT=0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c
~ Contrato BNB para comprar token.

PANCAKE_FACTORY=0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73
~ Contrato Pancake Factory para pegar função de compra.

PANCAKE_ROUTER=0x10ED43C718714eb63d5aA57B78B54704E256024E
~ Pancake Factory contract para processar a função de compra.

WALLET_ADDRESS=
~ Seu endereço BSC (BEP20) da Metamask.

SLIPPAGE=1
~ Configure seu slippage aqui, não pode decimais. (exemplo: 1, 5, 10).
se comprar token no lançamento recomendado 30+ de slippage.

GWEI=5
~ Configure seu GWEI (gas fee) aqui, não pode decimais. (exemplo: 5, 10, 25).
se comprar token no lançamento recomendado 15+ GWEI.

GAS_LIMIT=250000
~ Limite minimo 210000, quanto mais melhor.

MIN_LIQUIDITY_BNB=3
~ Defina quantidade de liquidez mínima adicionada no endereço do par que você
deseja comprar, definido no BNB. (por exemplo: 2, 4, 7).
2 significa 2 liquidez de BNB adicionada.

WALLET_MNEMONIC=
~ Insira sua chave privada aqui, que você obtém com a Wallet.

AMOUNT_OF_BNB=0.002
~ Quantidade de BNB para compra.

TOKEN_PURCHASE_CONTRACT=0xe9e7cea3dedca5984780bafc599bd69add087d56
~ Endereço do token para compra.

```

4. Rode com <code>npm run snipe</code>

5. Aguarde o bot executar o a função, se tiver sucesso ele apresentara o link da transação.

## POSSIVEIS PROBLEMAS

- Seu GWEI é muito baixo (use 15+ para lançamento de token).
- Seus slippage é muito baixo (use 30+ para lançamento de toke).
  
Recomendado private node: 
  1. https://getblock.io/en/
  2. https://www.quicknode.com/
  3. https://www.ankr.com/
   
https://getblock.io/en/ tem um serviço com poucos disparos gratuitos por dia, mas não indicado para usar em compra de lançamento.
