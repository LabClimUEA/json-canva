import "dotenv/config";
import ExcelJS from "exceljs";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const apiUrl = process.env.API_URL;
const bearerToken = process.env.BEARER_TOKEN || process.env.API_TOKEN;
const outputFile = process.env.OUTPUT_FILE || "output/cotas-hidrologicas.xlsx";
const timezone = process.env.TIMEZONE || "America/Manaus";

if (!apiUrl) {
  throw new Error("Defina API_URL no .env com o endpoint do payload.");
}

if (!bearerToken) {
  throw new Error("Defina BEARER_TOKEN no .env com o token de acesso.");
}

const response = await fetch(apiUrl, {
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${bearerToken}`,
  },
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Falha ao buscar payload: HTTP ${response.status} ${response.statusText}\n${body}`);
}

const payload = await response.json();

if (!Array.isArray(payload.data)) {
  throw new Error("Payload inválido: esperado um array em data.");
}

const headers = ["Data"];
const row = [formatToday()];

for (const item of payload.data) {
  const stationName = item?.station_hydro?.name;
  const actual = toNumberOrNull(item.actual_cota);
  const previous = toNumberOrNull(item.previous_cota);

  if (!stationName || actual === null || previous === null) {
    continue;
  }

  headers.push(`${stationName} - Cota atual`, `${stationName} - Variacao`);
  row.push(formatCurrentLevel(actual), formatVariation(actual, previous));
}

if (headers.length === 1) {
  throw new Error("Nenhuma estação com cota atual e cota anterior válidas foi encontrada no payload.");
}

const outputPath = path.resolve(outputFile);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Cotas");

worksheet.addRow(headers);
worksheet.addRow(row);
worksheet.columns.forEach((column) => {
  column.width = 24;
});

worksheet.getRow(1).font = { bold: true };
worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center", wrapText: true };

await workbook.xlsx.writeFile(outputPath);

console.log(`Excel gerado em ${outputPath}`);

function formatToday() {
  const date = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date());

  return `BOLETIM DIÁRIO ${date}`;
}

function formatCurrentLevel(value) {
  return `Cota Atual: ${formatDecimal(value)}m`;
}

function formatVariation(actual, previous) {
  const centimeters = Math.round((actual - previous) * 100);

  if (Math.abs(centimeters) >= 100) {
    return `${formatDecimal(centimeters / 100)}m`;
  }

  return `${centimeters}cm`;
}

function formatDecimal(value) {
  return Number(value.toFixed(2)).toString();
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
