# json-canva

Gera um Excel a partir de um endpoint JSON protegido por Bearer Token.

## Configuracao

Crie/preencha o arquivo `.env`:

```env
API_URL=https://exemplo.com/endpoint
BEARER_TOKEN=seu_token
OUTPUT_FILE=output/cotas-hidrologicas.xlsx
TIMEZONE=America/Manaus
```

`OUTPUT_FILE` e opcional. Se nao for informado, o arquivo sera gerado em `output/cotas-hidrologicas.xlsx`.
`TIMEZONE` tambem e opcional. Se nao for informado, sera usado `America/Manaus`.

## Como executar

```bash
npm install
npm run export
```

O comando `npm install` precisa ser executado pelo menos uma vez para instalar as dependencias.
Depois disso, use `npm run export` sempre que quiser buscar os dados do endpoint e gerar um novo Excel.

Por padrao, o arquivo sera salvo em:

```text
output/cotas-hidrologicas.xlsx
```

## Formato do Excel

O Excel tera uma unica linha de dados. A coluna A sera o boletim do dia no formato `BOLETIM DIÁRIO dd/mm/aaaa`.
Para cada estacao com `actual_cota`, `previous_cota`, `max_historic` e `min_historic` validos, serao criadas sete colunas:

- `<ESTACAO> - Cota atual`
- `<ESTACAO> - Cota Atual Cd I`
- `<ESTACAO> - Cota anterior`
- `<ESTACAO> - Variacao diaria`
- `<ESTACAO> - Variacao Diaria Cd I`
- `<ESTACAO> - Diferenca para o extremo maxima`
- `<ESTACAO> - Diferenca para o extremo minima`

Os valores serao formatados neste fluxo:

- `COTA ATUAL: 13.32m`
- `Cota Atual: 13.32m`
- `COTA ANTERIOR: 13.30m`
- `VARIAÇÃO DIÁRIA: 2cm`
- `2 cm`
- `DIFERENÇA PARA O EXTREMO (MÁXIMA): 1.88m`
- `DIFERENÇA PARA O EXTREMO (MÍNIMA): 0cm`

A variacao diaria e calculada como `actual_cota - previous_cota`.
A diferenca para a maxima e calculada como `max_historic - actual_cota`.
A diferenca para a minima e calculada como `actual_cota - min_historic`.
Valores menores que 100 centimetros ficam em centimetros, por exemplo `0.92` vira `92cm`; na coluna Cd I da variacao diaria, vira `92 cm`. A partir de 100 centimetros, o valor fica em metros, por exemplo `1m` ou `1 m` na coluna Cd I.
As diferencas para extremos nunca ficam negativas; nesse caso, o valor gerado sera `0cm`.

Exemplo de cabecalhos:

```text
Data | TABATINGA - Cota atual | TABATINGA - Cota Atual Cd I | TABATINGA - Cota anterior | TABATINGA - Variacao diaria | TABATINGA - Variacao Diaria Cd I | TABATINGA - Diferenca para o extremo maxima | TABATINGA - Diferenca para o extremo minima
```

Exemplo de linha gerada:

```text
BOLETIM DIÁRIO 18/05/2026 | COTA ATUAL: 11.66m | Cota Atual: 11.66m | COTA ANTERIOR: 11.65m | VARIAÇÃO DIÁRIA: 1cm | 1 cm | DIFERENÇA PARA O EXTREMO (MÁXIMA): 2.16m | DIFERENÇA PARA O EXTREMO (MÍNIMA): 14.2m
```
