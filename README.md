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
Para cada estacao com `actual_cota` e `previous_cota` validos, serao criadas duas colunas:

- `<ESTACAO> - Cota atual`
- `<ESTACAO> - Variacao`

O valor de cota atual e formatado como `Cota Atual: 11.56m`.
A variacao e calculada como `actual_cota - previous_cota`.
Quando o resultado absoluto for menor que 1 metro, ela sera formatada em centimetros, por exemplo `-10cm`, `1cm`, `62cm` ou `99cm`.
Quando o resultado absoluto for igual ou maior que 1 metro, ela sera formatada em metros, por exemplo `1m` ou `-1.2m`.

Exemplo de cabecalhos:

```text
Data | TABATINGA - Cota atual | TABATINGA - Variacao | FONTE BOA - Cota atual | FONTE BOA - Variacao
```

Exemplo de linha gerada:

```text
BOLETIM DIÁRIO 13/05/2026 | Cota Atual: 11.56m | 62cm | Cota Atual: 20.82m | 0cm
```
