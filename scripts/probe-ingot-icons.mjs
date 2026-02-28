const CANDIDATES = [
  "inv_ingot_01",
  "inv_ingot_02",
  "inv_ingot_03",
  "inv_ingot_04",
  "inv_ingot_05",
  "inv_ingot_06",
  "inv_ingot_07",
  "inv_ingot_08",
  "inv_ingot_09",
  "inv_ingot_10",
  "inv_ingot_11",
  "inv_ingot_12",
  "inv_ingot_13",
  "inv_ingot_14",
  "inv_ingot_15",
  "inv_ingot_16",
  "inv_ingot_17",
  "inv_ingot_18",
  "inv_ingot_19",
  "inv_ingot_20",
  "inv_ingot_21",
  "inv_ingot_22",
  "inv_ingot_23",
  "inv_ingot_24",
  "inv_ingot_25",
  "inv_ingot_26",
  "inv_ingot_27",
  "inv_ingot_28",
  "inv_ingot_29",
  "inv_ingot_30",
  "inv_ingot_31",
  "inv_ingot_32",
];

const BASE_URL = "https://wow.zamimg.com/images/wow/icons/large";

async function checkIcon(name) {
  const url = `${BASE_URL}/${name}.jpg`;
  const res = await fetch(url, { method: "HEAD" });
  return res.ok;
}

async function main() {
  for (const icon of CANDIDATES) {
    const ok = await checkIcon(icon);
    console.log(`${icon}: ${ok ? "OK" : "MISS"}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

