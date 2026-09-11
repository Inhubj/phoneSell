export type CatalogVariant = { ram: number; storage: number; price: number; original?: number };
export type CatalogDevice = {
  name: string;
  year?: number;
  ios?: boolean;
  series?: string;
  original?: number;
  deviceType?: "PHONE" | "LAPTOP" | "TABLET" | "OTHER";
  processor?: string;
  variants: CatalogVariant[];
};
export type CatalogBrand = { name: string; slug: string; devices: CatalogDevice[] };

/** Buyback offers are 15% below the listed catalogue value. */
const BUYBACK_PRICE_FACTOR = 0.85;

function v(ram: number, storage: number, price: number, original?: number): CatalogVariant {
  return { ram, storage, price: Math.round(price * BUYBACK_PRICE_FACTOR), original };
}

function stor(ram: number, items: Array<[number, number, number?]>): CatalogVariant[] {
  return items.map(([storage, price, original]) => v(ram, storage, price, original));
}

export const CATALOG: CatalogBrand[] = [
  {
    name: "Apple",
    slug: "apple",
    devices: [
      { name: "iPhone 11", year: 2019, ios: true, series: "iPhone", original: 49900, variants: stor(4, [[64, 12000, 49900], [128, 14500], [256, 16500]]) },
      { name: "iPhone 11 Pro", year: 2019, ios: true, series: "iPhone", original: 99600, variants: stor(4, [[64, 18000], [256, 21000], [512, 24000]]) },
      { name: "iPhone 11 Pro Max", year: 2019, ios: true, series: "iPhone", original: 109900, variants: stor(4, [[64, 20000], [256, 23000], [512, 26000]]) },
      { name: "iPhone 12 mini", year: 2020, ios: true, series: "iPhone", variants: stor(4, [[64, 16000], [128, 18500], [256, 20500]]) },
      { name: "iPhone 12", year: 2020, ios: true, series: "iPhone", original: 65900, variants: stor(4, [[64, 18500], [128, 21000], [256, 23500]]) },
      { name: "iPhone 12 Pro", year: 2020, ios: true, series: "iPhone", variants: stor(6, [[128, 25000], [256, 28000], [512, 31000]]) },
      { name: "iPhone 12 Pro Max", year: 2020, ios: true, series: "iPhone", variants: stor(6, [[128, 28000], [256, 31000], [512, 34000]]) },
      { name: "iPhone 13 mini", year: 2021, ios: true, series: "iPhone", variants: stor(4, [[128, 22000], [256, 25000], [512, 28000]]) },
      { name: "iPhone 13", year: 2021, ios: true, series: "iPhone", original: 69900, variants: stor(4, [[128, 25000], [256, 28500], [512, 32000]]) },
      { name: "iPhone 13 Pro", year: 2021, ios: true, series: "iPhone", variants: stor(6, [[128, 32000], [256, 36000], [512, 40000], [1024, 44000]]) },
      { name: "iPhone 13 Pro Max", year: 2021, ios: true, series: "iPhone", variants: stor(6, [[128, 35000], [256, 39000], [512, 43000], [1024, 47000]]) },
      { name: "iPhone 14", year: 2022, ios: true, series: "iPhone", variants: stor(6, [[128, 32000], [256, 36000], [512, 40000]]) },
      { name: "iPhone 14 Plus", year: 2022, ios: true, series: "iPhone", variants: stor(6, [[128, 34000], [256, 38000], [512, 42000]]) },
      { name: "iPhone 14 Pro", year: 2022, ios: true, series: "iPhone", variants: stor(6, [[128, 42000], [256, 47000], [512, 52000], [1024, 56000]]) },
      { name: "iPhone 14 Pro Max", year: 2022, ios: true, series: "iPhone", variants: stor(6, [[128, 46000], [256, 51000], [512, 56000], [1024, 60000]]) },
      { name: "iPhone 15", year: 2023, ios: true, series: "iPhone", variants: stor(6, [[128, 42000], [256, 47000], [512, 52000]]) },
      { name: "iPhone 15 Plus", year: 2023, ios: true, series: "iPhone", variants: stor(6, [[128, 45000], [256, 50000], [512, 55000]]) },
      { name: "iPhone 15 Pro", year: 2023, ios: true, series: "iPhone", variants: stor(8, [[128, 58000], [256, 64000], [512, 70000], [1024, 76000]]) },
      { name: "iPhone 15 Pro Max", year: 2023, ios: true, series: "iPhone", variants: stor(8, [[256, 70000], [512, 78000], [1024, 85000]]) },
      { name: "iPhone 16", year: 2024, ios: true, series: "iPhone", variants: stor(8, [[128, 52000], [256, 58000], [512, 64000]]) },
      { name: "iPhone 16 Plus", year: 2024, ios: true, series: "iPhone", variants: stor(8, [[128, 56000], [256, 62000], [512, 68000]]) },
      { name: "iPhone 16 Pro", year: 2024, ios: true, series: "iPhone", variants: stor(8, [[128, 72000], [256, 80000], [512, 88000], [1024, 96000]]) },
      { name: "iPhone 16 Pro Max", year: 2024, ios: true, series: "iPhone", variants: stor(8, [[256, 88000], [512, 98000], [1024, 108000]]) },
      { name: "iPhone 16e", year: 2025, ios: true, series: "iPhone", variants: stor(8, [[128, 40000], [256, 45000], [512, 50000]]) },
      { name: "iPhone 17", year: 2025, ios: true, series: "iPhone", variants: stor(8, [[256, 62000], [512, 70000]]) },
      { name: "iPhone 17 Air", year: 2025, ios: true, series: "iPhone", variants: stor(8, [[256, 68000], [512, 76000], [1024, 84000]]) },
      { name: "iPhone 17 Pro", year: 2025, ios: true, series: "iPhone", variants: stor(12, [[256, 90000], [512, 100000], [1024, 112000]]) },
      { name: "iPhone 17 Pro Max", year: 2025, ios: true, series: "iPhone", variants: stor(12, [[256, 105000], [512, 118000], [1024, 130000], [2048, 145000]]) },
      { name: "iPhone SE (2020)", year: 2020, ios: true, series: "iPhone SE", variants: stor(3, [[64, 7000], [128, 8500], [256, 10000]]) },
      { name: "iPhone SE (2022)", year: 2022, ios: true, series: "iPhone SE", variants: stor(4, [[64, 11000], [128, 13000], [256, 15000]]) },
      { name: "iPhone XR", year: 2018, ios: true, series: "iPhone", variants: stor(3, [[64, 8000], [128, 9500], [256, 11000]]) },
      { name: "iPhone XS", year: 2018, ios: true, series: "iPhone", variants: stor(4, [[64, 9000], [256, 11000], [512, 12500]]) },
      { name: "iPhone XS Max", year: 2018, ios: true, series: "iPhone", variants: stor(4, [[64, 10000], [256, 12000], [512, 13500]]) },
    ],
  },
  {
    name: "Samsung",
    slug: "samsung",
    devices: [
      ...["S20", "S20+", "S20 Ultra", "S21", "S21+", "S21 Ultra", "S21 FE", "S22", "S22+", "S22 Ultra", "S23", "S23+", "S23 Ultra", "S23 FE", "S24", "S24+", "S24 Ultra", "S24 FE", "S25", "S25+", "S25 Ultra"].map((n, i) => {
        const year = 2020 + Math.floor(i / 3);
        const base = 12000 + i * 2500;
        const ram = n.includes("Ultra") ? 12 : n.includes("FE") ? 8 : 8;
        const storages = n.includes("Ultra") ? [256, 512, 1024] : [128, 256];
        return {
          name: `Galaxy ${n}`,
          year,
          series: n.startsWith("S2") ? "Galaxy S" : "Galaxy S",
          variants: storages.map((s, si) => v(ram, s, base + si * 4000)),
        };
      }),
      ...["A14", "A15", "A16", "A23", "A24", "A25", "A32", "A33", "A34", "A35", "A36", "A52", "A53", "A54", "A55", "A56", "A73"].map((n, i) => ({
        name: `Galaxy ${n}`,
        year: 2021 + Math.floor(i / 4),
        series: "Galaxy A",
        variants: [v(4, 64, 5500 + i * 400), v(6, 128, 7500 + i * 500), v(8, 128, 9000 + i * 500), v(8, 256, 11000 + i * 600)],
      })),
      ...["M14", "M15", "M32", "M33", "M34", "M35", "M36", "M54"].map((n, i) => ({
        name: `Galaxy ${n}`,
        year: 2022,
        series: "Galaxy M",
        variants: [v(4, 64, 4500 + i * 300), v(6, 128, 6500 + i * 400), v(8, 128, 8000 + i * 400)],
      })),
      ...["F14", "F15", "F23", "F34", "F54", "F55"].map((n, i) => ({
        name: `Galaxy ${n}`,
        year: 2023,
        series: "Galaxy F",
        variants: [v(4, 64, 4200 + i * 300), v(6, 128, 6200 + i * 400), v(8, 128, 7800 + i * 400)],
      })),
      { name: "Galaxy Note 20", year: 2020, series: "Galaxy Note", variants: [v(8, 256, 16000)] },
      { name: "Galaxy Note 20 Ultra", year: 2020, series: "Galaxy Note", variants: [v(12, 256, 22000), v(12, 512, 25000)] },
      ...[3, 4, 5, 6, 7].map((n) => ({
        name: `Galaxy Z Fold ${n}`,
        year: 2021 + n - 3,
        series: "Galaxy Z Fold",
        variants: [v(12, 256, 45000 + n * 5000), v(12, 512, 52000 + n * 5000)],
      })),
      ...[3, 4, 5, 6, 7].map((n) => ({
        name: `Galaxy Z Flip ${n}`,
        year: 2021 + n - 3,
        series: "Galaxy Z Flip",
        variants: [v(8, 128, 22000 + n * 3000), v(8, 256, 26000 + n * 3000)],
      })),
    ],
  },
  {
    name: "OnePlus",
    slug: "oneplus",
    devices: [
      { name: "OnePlus 7", year: 2019, series: "OnePlus", variants: [v(6, 128, 7000), v(8, 256, 8500)] },
      { name: "OnePlus 7T", year: 2019, series: "OnePlus", variants: [v(8, 128, 8000), v(8, 256, 9500)] },
      { name: "OnePlus 7 Pro", year: 2019, series: "OnePlus", variants: [v(6, 128, 9000), v(8, 256, 11000), v(12, 256, 12500)] },
      { name: "OnePlus 8", year: 2020, series: "OnePlus", variants: [v(8, 128, 10000), v(12, 256, 12000)] },
      { name: "OnePlus 8T", year: 2020, series: "OnePlus", variants: [v(8, 128, 11000), v(12, 256, 13000)] },
      { name: "OnePlus 8 Pro", year: 2020, series: "OnePlus", variants: [v(8, 128, 12500), v(12, 256, 14500)] },
      { name: "OnePlus 9", year: 2021, series: "OnePlus", variants: [v(8, 128, 13000), v(12, 256, 15000)] },
      { name: "OnePlus 9R", year: 2021, series: "OnePlus", variants: [v(8, 128, 12000), v(12, 256, 14000)] },
      { name: "OnePlus 9 Pro", year: 2021, series: "OnePlus", variants: [v(8, 128, 16000), v(12, 256, 18500)] },
      { name: "OnePlus 10T", year: 2022, series: "OnePlus", variants: [v(8, 128, 16000), v(12, 256, 18500), v(16, 256, 20000)] },
      { name: "OnePlus 10 Pro", year: 2022, series: "OnePlus", variants: [v(8, 128, 18000), v(12, 256, 21000)] },
      { name: "OnePlus 11", year: 2023, series: "OnePlus", variants: [v(8, 128, 22000), v(16, 256, 26000)] },
      { name: "OnePlus 11R", year: 2023, series: "OnePlus", variants: [v(8, 128, 18000), v(16, 256, 22000)] },
      { name: "OnePlus 12", year: 2024, series: "OnePlus", variants: [v(12, 256, 32000), v(16, 256, 35000), v(16, 512, 39000)] },
      { name: "OnePlus 12R", year: 2024, series: "OnePlus", variants: [v(8, 128, 24000), v(16, 256, 28000)] },
      { name: "OnePlus 13", year: 2025, series: "OnePlus", variants: [v(12, 256, 42000), v(16, 512, 48000)] },
      { name: "OnePlus 13R", year: 2025, series: "OnePlus", variants: [v(12, 256, 32000), v(16, 256, 36000)] },
      { name: "OnePlus Nord", year: 2020, series: "Nord", variants: [v(6, 64, 6000), v(8, 128, 7500), v(12, 256, 9000)] },
      { name: "OnePlus Nord 2", year: 2021, series: "Nord", variants: [v(8, 128, 9000), v(12, 256, 11000)] },
      { name: "OnePlus Nord 2T", year: 2022, series: "Nord", variants: [v(8, 128, 10000), v(12, 256, 12000)] },
      { name: "OnePlus Nord 3", year: 2023, series: "Nord", variants: [v(8, 128, 14000), v(16, 256, 17000)] },
      { name: "OnePlus Nord 4", year: 2024, series: "Nord", variants: [v(8, 128, 18000), v(16, 256, 22000)] },
      { name: "OnePlus Nord CE", year: 2021, series: "Nord CE", variants: [v(6, 128, 7000), v(8, 128, 8500)] },
      { name: "OnePlus Nord CE 2", year: 2022, series: "Nord CE", variants: [v(6, 128, 8000), v(8, 128, 9500)] },
      { name: "OnePlus Nord CE 3", year: 2023, series: "Nord CE", variants: [v(8, 128, 11000), v(12, 256, 13500)] },
      { name: "OnePlus Nord CE 4", year: 2024, series: "Nord CE", variants: [v(8, 128, 14000), v(8, 256, 16000)] },
      { name: "OnePlus Nord CE 3 Lite", year: 2023, series: "Nord CE", variants: [v(8, 128, 8500), v(8, 256, 10000)] },
    ],
  },
  {
    name: "Xiaomi",
    slug: "xiaomi",
    devices: [
      { name: "Xiaomi 11 Lite NE", year: 2021, series: "Xiaomi", variants: [v(6, 128, 9000), v(8, 128, 10500)] },
      { name: "Xiaomi 11T", year: 2021, series: "Xiaomi", variants: [v(8, 128, 11000), v(8, 256, 12500)] },
      { name: "Xiaomi 11T Pro", year: 2021, series: "Xiaomi", variants: [v(8, 128, 13000), v(12, 256, 15500)] },
      { name: "Xiaomi 12", year: 2022, series: "Xiaomi", variants: [v(8, 128, 14000), v(8, 256, 16000)] },
      { name: "Xiaomi 12 Pro", year: 2022, series: "Xiaomi", variants: [v(8, 256, 18000), v(12, 256, 20000)] },
      { name: "Xiaomi 13", year: 2023, series: "Xiaomi", variants: [v(8, 256, 22000), v(12, 256, 25000)] },
      { name: "Xiaomi 13 Pro", year: 2023, series: "Xiaomi", variants: [v(12, 256, 28000), v(12, 512, 32000)] },
      { name: "Xiaomi 14", year: 2024, series: "Xiaomi", variants: [v(12, 256, 32000), v(16, 512, 38000)] },
      { name: "Xiaomi 14 Ultra", year: 2024, series: "Xiaomi", variants: [v(16, 512, 52000), v(16, 1024, 58000)] },
      { name: "Xiaomi 15", year: 2025, series: "Xiaomi", variants: [v(12, 256, 38000), v(16, 512, 45000)] },
      { name: "Mi 10T", year: 2020, series: "Mi", variants: [v(6, 128, 8000), v(8, 128, 9500)] },
      { name: "Mi 10T Pro", year: 2020, series: "Mi", variants: [v(8, 128, 10000), v(8, 256, 11500)] },
      { name: "Mi 11X", year: 2021, series: "Mi", variants: [v(6, 128, 9000), v(8, 128, 10500)] },
      { name: "Mi 11X Pro", year: 2021, series: "Mi", variants: [v(8, 128, 11000), v(8, 256, 12500)] },
    ],
  },
  {
    name: "Redmi",
    slug: "redmi",
    devices: [
      ...["Note 10", "Note 10 Pro", "Note 10S", "Note 11", "Note 11 Pro", "Note 11T 5G", "Note 12", "Note 12 Pro", "Note 12 Pro+", "Note 13", "Note 13 Pro", "Note 13 Pro+", "Note 14", "Note 14 Pro", "Note 14 Pro+"].map((n, i) => ({
        name: `Redmi ${n}`,
        year: 2021 + Math.floor(i / 3),
        series: "Redmi Note",
        variants: [v(4, 64, 5000 + i * 400), v(6, 128, 7000 + i * 500), v(8, 128, 8500 + i * 500), v(8, 256, 10000 + i * 600)],
      })),
      ...["9A", "9 Power", "10", "10 Prime", "11", "12", "12 5G", "13", "13 5G", "13C", "14C", "A3", "A4"].map((n, i) => ({
        name: `Redmi ${n}`,
        year: 2021 + Math.floor(i / 3),
        series: "Redmi",
        variants: [v(3, 32, 2800 + i * 200), v(4, 64, 4000 + i * 250), v(6, 128, 5500 + i * 300)],
      })),
      { name: "Redmi K20", year: 2019, series: "Redmi K", variants: [v(6, 64, 7000), v(6, 128, 8500)] },
      { name: "Redmi K20 Pro", year: 2019, series: "Redmi K", variants: [v(6, 128, 9000), v(8, 256, 11000)] },
      { name: "Redmi K50i", year: 2022, series: "Redmi K", variants: [v(6, 128, 10000), v(8, 256, 12000)] },
    ],
  },
  {
    name: "POCO",
    slug: "poco",
    devices: [
      ...["X3", "X3 Pro", "X4 Pro 5G", "X5", "X5 Pro", "X6", "X6 Pro", "X7", "X7 Pro"].map((n, i) => ({
        name: `POCO ${n}`,
        year: 2020 + Math.floor(i / 2),
        series: "POCO X",
        variants: [v(6, 128, 8000 + i * 800), v(8, 128, 9500 + i * 800), v(8, 256, 11000 + i * 900)],
      })),
      ...["F3 GT", "F4", "F5", "F5 Pro", "F6", "F6 Pro", "F7"].map((n, i) => ({
        name: `POCO ${n}`,
        year: 2021 + i,
        series: "POCO F",
        variants: [v(8, 128, 12000 + i * 1500), v(12, 256, 15000 + i * 1500)],
      })),
      ...["M3", "M4 Pro", "M5", "M6", "M6 Pro", "M7"].map((n, i) => ({
        name: `POCO ${n}`,
        year: 2021 + i,
        series: "POCO M",
        variants: [v(4, 64, 4500 + i * 400), v(6, 128, 6500 + i * 500), v(8, 128, 8000 + i * 500)],
      })),
    ],
  },
  {
    name: "vivo",
    slug: "vivo",
    devices: [
      ...["V23", "V25", "V27", "V29", "V30", "V40", "V50"].map((n, i) => ({
        name: `vivo ${n}`,
        year: 2022 + i,
        series: "vivo V",
        variants: [v(8, 128, 12000 + i * 1500), v(8, 256, 14000 + i * 1500), v(12, 256, 16000 + i * 1600)],
      })),
      ...["Y16", "Y17s", "Y22", "Y27", "Y28", "Y35", "Y36", "Y56", "Y200"].map((n, i) => ({
        name: `vivo ${n}`,
        year: 2022,
        series: "vivo Y",
        variants: [v(4, 64, 4500 + i * 300), v(6, 128, 6500 + i * 350), v(8, 128, 8000 + i * 400)],
      })),
      ...["T1", "T2", "T2x", "T3"].map((n, i) => ({
        name: `vivo ${n}`,
        year: 2022 + i,
        series: "vivo T",
        variants: [v(6, 128, 8000 + i * 800), v(8, 128, 9500 + i * 800)],
      })),
      { name: "vivo X80", year: 2022, series: "vivo X", variants: [v(8, 128, 18000), v(12, 256, 22000)] },
      { name: "vivo X90", year: 2023, series: "vivo X", variants: [v(8, 256, 24000), v(12, 256, 28000)] },
      { name: "vivo X100", year: 2024, series: "vivo X", variants: [v(12, 256, 32000), v(16, 512, 38000)] },
      { name: "vivo X200", year: 2025, series: "vivo X", variants: [v(12, 256, 38000), v(16, 512, 45000)] },
    ],
  },
  {
    name: "OPPO",
    slug: "oppo",
    devices: [
      ...["A17", "A18", "A38", "A58", "A59", "A78", "A79"].map((n, i) => ({
        name: `OPPO ${n}`,
        year: 2022,
        series: "OPPO A",
        variants: [v(4, 64, 5000 + i * 300), v(6, 128, 7000 + i * 400), v(8, 128, 8500 + i * 400)],
      })),
      ...["Reno 8", "Reno 8 Pro", "Reno 10", "Reno 11", "Reno 12", "Reno 13"].map((n, i) => ({
        name: `OPPO ${n}`,
        year: 2022 + Math.floor(i / 2),
        series: "OPPO Reno",
        variants: [v(8, 128, 14000 + i * 1500), v(8, 256, 16500 + i * 1500), v(12, 256, 19000 + i * 1600)],
      })),
      { name: "OPPO Find X5", year: 2022, series: "OPPO Find", variants: [v(8, 256, 22000), v(12, 256, 25000)] },
      { name: "OPPO Find X8", year: 2024, series: "OPPO Find", variants: [v(12, 256, 38000), v(16, 512, 45000)] },
      { name: "OPPO F21 Pro", year: 2022, series: "OPPO F", variants: [v(8, 128, 10000), v(8, 256, 12000)] },
      { name: "OPPO F25 Pro", year: 2024, series: "OPPO F", variants: [v(8, 128, 14000), v(8, 256, 16500)] },
    ],
  },
  {
    name: "Realme",
    slug: "realme",
    devices: [
      ...["8", "8 Pro", "9", "9 Pro", "9 Pro+", "10", "10 Pro", "11", "11 Pro", "11 Pro+", "12", "12 Pro", "13", "13 Pro", "14 Pro"].map((n, i) => ({
        name: `Realme ${n}`,
        year: 2021 + Math.floor(i / 3),
        series: "Realme Numbered",
        variants: [v(6, 128, 7000 + i * 500), v(8, 128, 8500 + i * 500), v(8, 256, 10000 + i * 600)],
      })),
      ...["Narzo 50", "Narzo 60", "Narzo 70", "C33", "C53", "C55", "C67", "GT Neo 3", "GT 6"].map((n, i) => ({
        name: `Realme ${n}`,
        year: 2022,
        series: n.startsWith("GT") ? "Realme GT" : n.startsWith("Narzo") ? "Realme Narzo" : "Realme C",
        variants: [v(4, 64, 4500 + i * 400), v(6, 128, 6500 + i * 500), v(8, 128, 8000 + i * 500)],
      })),
    ],
  },
  {
    name: "Motorola",
    slug: "motorola",
    devices: [
      ...["G32", "G34", "G54", "G64", "G73", "G84", "G85"].map((n, i) => ({
        name: `Motorola ${n}`,
        year: 2023,
        series: "Moto G",
        variants: [v(4, 64, 5500 + i * 400), v(8, 128, 8000 + i * 500), v(8, 256, 9500 + i * 500)],
      })),
      ...["Edge 30", "Edge 40", "Edge 50", "Edge 50 Pro", "Edge 50 Ultra"].map((n, i) => ({
        name: `Motorola ${n}`,
        year: 2022 + i,
        series: "Moto Edge",
        variants: [v(8, 128, 14000 + i * 2000), v(8, 256, 16500 + i * 2000), v(12, 256, 19000 + i * 2200)],
      })),
      { name: "Motorola Razr 40", year: 2023, series: "Razr", variants: [v(8, 256, 28000)] },
      { name: "Motorola Razr 50", year: 2024, series: "Razr", variants: [v(8, 256, 36000), v(12, 512, 42000)] },
    ],
  },
  {
    name: "Google Pixel",
    slug: "google-pixel",
    devices: [
      { name: "Pixel 6", year: 2021, series: "Pixel", variants: [v(8, 128, 14000), v(8, 256, 16500)] },
      { name: "Pixel 6a", year: 2022, series: "Pixel", variants: [v(6, 128, 11000)] },
      { name: "Pixel 6 Pro", year: 2021, series: "Pixel", variants: [v(12, 128, 18000), v(12, 256, 21000)] },
      { name: "Pixel 7", year: 2022, series: "Pixel", variants: [v(8, 128, 18000), v(8, 256, 21000)] },
      { name: "Pixel 7a", year: 2023, series: "Pixel", variants: [v(8, 128, 16000)] },
      { name: "Pixel 7 Pro", year: 2022, series: "Pixel", variants: [v(12, 128, 24000), v(12, 256, 28000)] },
      { name: "Pixel 8", year: 2023, series: "Pixel", variants: [v(8, 128, 26000), v(8, 256, 30000)] },
      { name: "Pixel 8a", year: 2024, series: "Pixel", variants: [v(8, 128, 22000), v(8, 256, 25000)] },
      { name: "Pixel 8 Pro", year: 2023, series: "Pixel", variants: [v(12, 128, 34000), v(12, 256, 39000)] },
      { name: "Pixel 9", year: 2024, series: "Pixel", variants: [v(12, 128, 38000), v(12, 256, 44000)] },
      { name: "Pixel 9 Pro", year: 2024, series: "Pixel", variants: [v(16, 128, 52000), v(16, 256, 58000), v(16, 512, 64000)] },
      { name: "Pixel 9 Pro XL", year: 2024, series: "Pixel", variants: [v(16, 256, 62000), v(16, 512, 70000)] },
      { name: "Pixel 9a", year: 2025, series: "Pixel", variants: [v(8, 128, 28000), v(8, 256, 32000)] },
    ],
  },
  {
    name: "Nothing",
    slug: "nothing",
    devices: [
      { name: "Nothing Phone (1)", year: 2022, series: "Phone", variants: [v(8, 128, 14000), v(8, 256, 16500), v(12, 256, 18000)] },
      { name: "Nothing Phone (2)", year: 2023, series: "Phone", variants: [v(8, 128, 20000), v(12, 256, 24000), v(12, 512, 27000)] },
      { name: "Nothing Phone (2a)", year: 2024, series: "Phone", variants: [v(8, 128, 15000), v(8, 256, 17500), v(12, 256, 19000)] },
      { name: "Nothing Phone (3a)", year: 2025, series: "Phone", variants: [v(8, 128, 18000), v(12, 256, 22000)] },
      { name: "Nothing Phone (3)", year: 2025, series: "Phone", variants: [v(12, 256, 32000), v(16, 512, 38000)] },
    ],
  },
  {
    name: "iQOO",
    slug: "iqoo",
    devices: [
      { name: "iQOO Z7", year: 2023, series: "iQOO Z", variants: [v(6, 128, 9000), v(8, 128, 10500)] },
      { name: "iQOO Z9", year: 2024, series: "iQOO Z", variants: [v(8, 128, 12000), v(8, 256, 14000)] },
      { name: "iQOO Neo 7", year: 2023, series: "iQOO Neo", variants: [v(8, 128, 14000), v(12, 256, 17000)] },
      { name: "iQOO Neo 9 Pro", year: 2024, series: "iQOO Neo", variants: [v(8, 256, 20000), v(12, 256, 23000)] },
      { name: "iQOO 11", year: 2023, series: "iQOO", variants: [v(8, 128, 22000), v(16, 256, 27000)] },
      { name: "iQOO 12", year: 2024, series: "iQOO", variants: [v(12, 256, 30000), v(16, 512, 36000)] },
      { name: "iQOO 13", year: 2025, series: "iQOO", variants: [v(12, 256, 38000), v(16, 512, 45000)] },
    ],
  },
  {
    name: "Nokia",
    slug: "nokia",
    devices: [
      { name: "Nokia G21", year: 2022, series: "Nokia G", variants: [v(4, 64, 4000), v(6, 128, 5500)] },
      { name: "Nokia G42", year: 2023, series: "Nokia G", variants: [v(6, 128, 6500)] },
      { name: "Nokia X30", year: 2022, series: "Nokia X", variants: [v(6, 128, 9000), v(8, 256, 11000)] },
      { name: "Nokia 8.3 5G", year: 2020, series: "Nokia", variants: [v(6, 64, 7000), v(8, 128, 8500)] },
      { name: "Nokia 5.4", year: 2021, series: "Nokia", variants: [v(4, 64, 3500), v(6, 64, 4200)] },
    ],
  },
  {
    name: "Honor",
    slug: "honor",
    devices: [
      { name: "Honor 90", year: 2023, series: "Honor", variants: [v(8, 256, 14000), v(12, 256, 16500)] },
      { name: "Honor 200", year: 2024, series: "Honor", variants: [v(8, 256, 16000), v(12, 256, 19000)] },
      { name: "Honor X9b", year: 2024, series: "Honor X", variants: [v(8, 256, 12000), v(12, 256, 14500)] },
      { name: "Honor 400", year: 2025, series: "Honor", variants: [v(8, 256, 18000), v(12, 512, 22000)] },
    ],
  },
  {
    name: "Asus",
    slug: "asus",
    devices: [
      { name: "Asus Zenfone 8", year: 2021, series: "Zenfone", variants: [v(6, 128, 12000), v(8, 256, 14500)] },
      { name: "Asus Zenfone 9", year: 2022, series: "Zenfone", variants: [v(8, 128, 16000), v(8, 256, 18500)] },
      { name: "Asus Zenfone 10", year: 2023, series: "Zenfone", variants: [v(8, 128, 20000), v(8, 256, 23000)] },
      { name: "Asus ROG Phone 6", year: 2022, series: "ROG Phone", variants: [v(12, 256, 28000), v(16, 512, 34000)] },
      { name: "Asus ROG Phone 8", year: 2024, series: "ROG Phone", variants: [v(16, 256, 42000), v(24, 512, 52000)] },
    ],
  },
  {
    name: "Sony",
    slug: "sony",
    devices: [
      { name: "Sony Xperia 1 III", year: 2021, series: "Xperia", variants: [v(12, 256, 18000)] },
      { name: "Sony Xperia 1 IV", year: 2022, series: "Xperia", variants: [v(12, 256, 22000)] },
      { name: "Sony Xperia 1 V", year: 2023, series: "Xperia", variants: [v(12, 256, 28000)] },
      { name: "Sony Xperia 5 III", year: 2021, series: "Xperia", variants: [v(8, 128, 14000)] },
      { name: "Sony Xperia 10 V", year: 2023, series: "Xperia", variants: [v(6, 128, 10000), v(8, 128, 11500)] },
    ],
  },
  {
    name: "LG",
    slug: "lg",
    devices: [
      { name: "LG Velvet", year: 2020, series: "LG", variants: [v(6, 128, 6000), v(8, 128, 7500)] },
      { name: "LG Wing", year: 2020, series: "LG", variants: [v(8, 128, 8000)] },
      { name: "LG G8 ThinQ", year: 2019, series: "LG", variants: [v(6, 128, 5000)] },
      { name: "LG V60 ThinQ", year: 2020, series: "LG", variants: [v(8, 128, 7000)] },
    ],
  },
  {
    name: "Infinix",
    slug: "infinix",
    devices: [
      ...["Hot 30", "Hot 40", "Hot 50", "Note 30", "Note 40", "Zero 30", "GT 20 Pro"].map((n, i) => ({
        name: `Infinix ${n}`,
        year: 2023,
        series: n.startsWith("Hot") ? "Hot" : n.startsWith("Note") ? "Note" : "Infinix",
        variants: [v(4, 64, 4000 + i * 400), v(8, 128, 6500 + i * 500), v(8, 256, 8000 + i * 500)],
      })),
    ],
  },
  {
    name: "Tecno",
    slug: "tecno",
    devices: [
      ...["Spark 10", "Spark 20", "Pova 5", "Pova 6", "Camon 20", "Camon 30"].map((n, i) => ({
        name: `Tecno ${n}`,
        year: 2023,
        series: n.split(" ")[0]!,
        variants: [v(4, 64, 3800 + i * 400), v(8, 128, 6000 + i * 500), v(8, 256, 7500 + i * 500)],
      })),
    ],
  },
  {
    name: "Lava",
    slug: "lava",
    devices: [
      { name: "Lava Blaze 2", year: 2023, series: "Blaze", variants: [v(4, 64, 3200), v(6, 128, 4200)] },
      { name: "Lava Blaze 5G", year: 2023, series: "Blaze", variants: [v(4, 128, 4500), v(8, 128, 5800)] },
      { name: "Lava Agni 2", year: 2023, series: "Agni", variants: [v(8, 128, 8000), v(8, 256, 9500)] },
      { name: "Lava Yuva 2", year: 2023, series: "Yuva", variants: [v(3, 64, 2800), v(4, 64, 3400)] },
    ],
  },
  {
    name: "Micromax",
    slug: "micromax",
    devices: [
      { name: "Micromax IN 2b", year: 2021, series: "IN", variants: [v(4, 64, 2500)] },
      { name: "Micromax IN Note 1", year: 2020, series: "IN", variants: [v(4, 64, 3000), v(4, 128, 3600)] },
      { name: "Micromax IN 1b", year: 2021, series: "IN", variants: [v(2, 32, 1800)] },
    ],
  },
  {
    name: "HTC",
    slug: "htc",
    devices: [
      { name: "HTC U12+", year: 2018, series: "U", variants: [v(6, 64, 4000), v(6, 128, 5000)] },
      { name: "HTC Desire 22 Pro", year: 2022, series: "Desire", variants: [v(8, 128, 7000)] },
    ],
  },
  {
    name: "Lenovo",
    slug: "lenovo",
    devices: [
      { name: "Lenovo Legion Duel 2", year: 2021, series: "Legion", variants: [v(12, 256, 14000), v(16, 512, 17000)] },
      { name: "Lenovo K13", year: 2021, series: "K", variants: [v(2, 32, 1800), v(4, 64, 2600)] },
      { name: "Lenovo K14 Plus", year: 2021, series: "K", variants: [v(4, 64, 2800)] },
      { name: "Lenovo ThinkPad E14", year: 2023, series: "ThinkPad", deviceType: "LAPTOP", processor: "Intel Core i5", variants: [v(8, 256, 18000), v(16, 512, 24000)] },
      { name: "Lenovo IdeaPad Slim 3", year: 2024, series: "IdeaPad", deviceType: "LAPTOP", processor: "Ryzen 5", variants: [v(8, 512, 16000), v(16, 512, 20000)] },
    ],
  },
  {
    name: "Dell",
    slug: "dell",
    devices: [
      { name: "Dell Inspiron 15", year: 2023, series: "Inspiron", deviceType: "LAPTOP", processor: "Intel Core i5", variants: [v(8, 512, 17000), v(16, 512, 21000)] },
      { name: "Dell XPS 13", year: 2023, series: "XPS", deviceType: "LAPTOP", processor: "Intel Core i7", variants: [v(16, 512, 38000), v(16, 1024, 45000)] },
    ],
  },
  {
    name: "HP",
    slug: "hp",
    devices: [
      { name: "HP Pavilion 15", year: 2023, series: "Pavilion", deviceType: "LAPTOP", processor: "Ryzen 5", variants: [v(8, 512, 16000), v(16, 512, 20000)] },
      { name: "HP Victus 16", year: 2024, series: "Victus", deviceType: "LAPTOP", processor: "Intel Core i5", variants: [v(8, 512, 28000), v(16, 512, 34000)] },
    ],
  },
  {
    name: "Apple Mac",
    slug: "apple-mac",
    devices: [
      { name: "MacBook Air M1", year: 2020, ios: true, series: "MacBook Air", deviceType: "LAPTOP", processor: "Apple M1", variants: [v(8, 256, 32000), v(8, 512, 38000)] },
      { name: "MacBook Air M2", year: 2022, ios: true, series: "MacBook Air", deviceType: "LAPTOP", processor: "Apple M2", variants: [v(8, 256, 42000), v(16, 512, 52000)] },
      { name: "MacBook Air M3", year: 2024, ios: true, series: "MacBook Air", deviceType: "LAPTOP", processor: "Apple M3", variants: [v(8, 256, 52000), v(16, 512, 62000)] },
      { name: "MacBook Pro 14 M3", year: 2023, ios: true, series: "MacBook Pro", deviceType: "LAPTOP", processor: "Apple M3", variants: [v(8, 512, 78000), v(16, 512, 88000)] },
      { name: "iPad 10th Gen", year: 2022, ios: true, series: "iPad", deviceType: "TABLET", variants: [v(4, 64, 14000), v(4, 256, 18000)] },
      { name: "iPad Air M2", year: 2024, ios: true, series: "iPad", deviceType: "TABLET", variants: [v(8, 128, 32000), v(8, 256, 38000)] },
    ],
  },
  {
    name: "Other",
    slug: "other",
    devices: [
      { name: "Other Android Phone", year: 2020, series: "Other", variants: [v(4, 64, 3000), v(6, 128, 5000), v(8, 128, 7000), v(8, 256, 9000)] },
      { name: "Other Feature / Keypad Phone", year: 2018, series: "Other", variants: [v(0, 4, 500), v(0, 16, 800)] },
    ],
  },
];

