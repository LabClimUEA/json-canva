import "dotenv/config";
import ExcelJS from "exceljs";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const apiUrl = process.env.API_URL;
const bearerToken = process.env.BEARER_TOKEN || process.env.API_TOKEN;
const outputDir = process.env.OUTPUT_DIR || "output";
const whatsOutputFile = process.env.WHATS_OUTPUT_FILE || path.join(outputDir, "cota-hidrologicas-whats.xlsx");
const instagramOutputFile = process.env.INSTAGRAM_OUTPUT_FILE || path.join(outputDir, "cota-hidrologicas-instagram.xlsx");
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

const reportDate = formatToday();
const whatsHeaders = ["Data"];
const whatsRow = [reportDate];
const instagramHeaders = ["Data"];
const instagramRow = [reportDate];

for (const item of payload.data) {
  const stationName = item?.station_hydro?.name;
  const actual = toNumberOrNull(item.actual_cota);
  const previous = toNumberOrNull(item.previous_cota);
  const maxHistoric = toNumberOrNull(item.max_historic);
  const minHistoric = toNumberOrNull(item.min_historic);

  if (!stationName || actual === null || previous === null || maxHistoric === null || minHistoric === null) {
    continue;
  }

  whatsHeaders.push(
    `${stationName} - Cota atual`,
    `${stationName} - Cota anterior`,
    `${stationName} - Variacao diaria`,
    `${stationName} - Diferenca para o extremo maxima`,
    `${stationName} - Diferenca para o extremo minima`,
  );
  whatsRow.push(
    formatCurrentLevel(actual),
    formatPreviousLevel(previous),
    formatDailyVariation(actual, previous),
    formatDifferenceToMaximum(actual, maxHistoric),
    formatDifferenceToMinimum(actual, minHistoric),
  );

  instagramHeaders.push(
    `${stationName} - Cota Atual Cd I`,
    `${stationName} - Variacao Diaria Cd I`,
  );
  instagramRow.push(
    formatCurrentLevelTitle(actual),
    formatDailyVariationTitle(actual, previous),
  );
}

if (whatsHeaders.length === 1 || instagramHeaders.length === 1) {
  throw new Error("Nenhuma estação com cota atual, cota anterior e extremos históricos válidos foi encontrada no payload.");
}

const whatsOutputPath = await writeWorkbook(whatsOutputFile, whatsHeaders, whatsRow);
const instagramOutputPath = await writeWorkbook(instagramOutputFile, instagramHeaders, instagramRow);

console.log("Excel WhatsApp gerado em " + whatsOutputPath);
console.log("Excel Instagram gerado em " + instagramOutputPath);

function writeWorkbook(outputFile, headers, row) {
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

  return workbook.xlsx.writeFile(outputPath).then(() => outputPath);
}

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
  return `COTA ATUAL: ${formatMeters(value)}`;
}

function formatCurrentLevelTitle(value) {
  return `Cota Atual: ${formatMeters(value)}`;
}

function formatPreviousLevel(value) {
  return `COTA ANTERIOR: ${formatMeters(value)}`;
}

function formatDailyVariation(actual, previous) {
  return `VARIAÇÃO DIÁRIA: ${formatDistance(actual - previous)}`;
}

function formatDailyVariationTitle(actual, previous) {
  return formatDistanceSpaced(actual - previous);
}

function formatDifferenceToMaximum(actual, maxHistoric) {
  return `DIFERENÇA PARA O EXTREMO (MÁXIMA): ${formatMeters(Math.max(maxHistoric - actual, 0))}`;
}

function formatDifferenceToMinimum(actual, minHistoric) {
  return `DIFERENÇA PARA O EXTREMO (MÍNIMA): ${formatMeters(Math.max(actual - minHistoric, 0))}`;
}

function formatMeters(value) {
  return formatDistance(value);
}

function formatDistance(value) {
  const centimeters = Math.round(value * 100);

  if (Math.abs(centimeters) >= 100) {
    return formatDecimal(centimeters / 100) + "m";
  }

  return centimeters + "cm";
}

function formatDistanceSpaced(value) {
  const centimeters = Math.round(value * 100);

  if (Math.abs(centimeters) >= 100) {
    return formatDecimal(centimeters / 100) + " m";
  }

  return centimeters + " cm";
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
