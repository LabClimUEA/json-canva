# json-canva

Gera arquivos Excel a partir de um endpoint JSON protegido por Bearer Token.

## Configuracao

Crie/preencha o arquivo `.env`:

```env
API_URL=https://exemplo.com/endpoint
BEARER_TOKEN=seu_token
OUTPUT_DIR=output
WHATS_OUTPUT_FILE=output/cota-hidrologicas-whats.xlsx
INSTAGRAM_OUTPUT_FILE=output/cota-hidrologicas-instagram.xlsx
TIMEZONE=America/Manaus
```

`OUTPUT_DIR`, `WHATS_OUTPUT_FILE` e `INSTAGRAM_OUTPUT_FILE` sao opcionais. Se nao forem informados, os arquivos serao gerados em `output/cota-hidrologicas-whats.xlsx` e `output/cota-hidrologicas-instagram.xlsx`.
`TIMEZONE` tambem e opcional. Se nao for informado, sera usado `America/Manaus`.

## Como executar

```bash
npm install
npm run export
```

O comando `npm install` precisa ser executado pelo menos uma vez para instalar as dependencias.
Depois disso, use `npm run export` sempre que quiser buscar os dados do endpoint e gerar novos arquivos Excel.

Por padrao, os arquivos serao salvos em:

```text
output/cota-hidrologicas-whats.xlsx
output/cota-hidrologicas-instagram.xlsx
```

## Formato do Excel

O script gera dois arquivos Excel, ambos com uma unica linha de dados. A coluna A sera o boletim do dia no formato `BOLETIM DIÁRIO dd/mm/aaaa`.
No arquivo WhatsApp, para cada estacao com `actual_cota`, `previous_cota`, `max_historic` e `min_historic` validos, serao criadas cinco colunas:

- `<ESTACAO> - Cota atual`
- `<ESTACAO> - Cota anterior`
- `<ESTACAO> - Variacao diaria`
- `<ESTACAO> - Diferenca para o extremo maxima`
- `<ESTACAO> - Diferenca para o extremo minima`

No arquivo Instagram, serao criadas apenas as colunas Cd I:

- `<ESTACAO> - Cota Atual Cd I`
- `<ESTACAO> - Variacao Diaria Cd I`

Os valores serao formatados neste fluxo:

- WhatsApp: `COTA ATUAL: 13.32m`, `COTA ANTERIOR: 13.30m`, `VARIAÇÃO DIÁRIA: 2cm`, `DIFERENÇA PARA O EXTREMO (MÁXIMA): 1.88m`, `DIFERENÇA PARA O EXTREMO (MÍNIMA): 0cm`
- Instagram: `Cota Atual: 13.32m`, `2 cm`

A variacao diaria e calculada como `actual_cota - previous_cota`.
A diferenca para a maxima e calculada como `max_historic - actual_cota`.
A diferenca para a minima e calculada como `actual_cota - min_historic`.
Valores menores que 100 centimetros ficam em centimetros, por exemplo `0.92` vira `92cm`; na coluna Cd I da variacao diaria, vira `92 cm`. A partir de 100 centimetros, o valor fica em metros, por exemplo `1m` ou `1 m` na coluna Cd I.
As diferencas para extremos nunca ficam negativas; nesse caso, o valor gerado sera `0cm`.

Exemplo de cabecalhos:

```text
Data | TABATINGA - Cota atual | TABATINGA - Cota anterior | TABATINGA - Variacao diaria | TABATINGA - Diferenca para o extremo maxima | TABATINGA - Diferenca para o extremo minima
Data | TABATINGA - Cota Atual Cd I | TABATINGA - Variacao Diaria Cd I
```

Exemplo de linha gerada:

```text
BOLETIM DIÁRIO 18/05/2026 | COTA ATUAL: 11.66m | COTA ANTERIOR: 11.65m | VARIAÇÃO DIÁRIA: 1cm | DIFERENÇA PARA O EXTREMO (MÁXIMA): 2.16m | DIFERENÇA PARA O EXTREMO (MÍNIMA): 14.2m
BOLETIM DIÁRIO 18/05/2026 | Cota Atual: 11.66m | 1 cm
```
