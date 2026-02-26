const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Referer: "https://wowpedia.fandom.com/",
};

async function searchFiles(query) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    list: "search",
    srnamespace: "6",
    srlimit: "20",
    origin: "*",
    srsearch: query,
  });
  const url = `https://wowpedia.fandom.com/api.php?${params.toString()}`;
  const response = await fetch(url, { headers });
  const json = await response.json();
  return (json?.query?.search || []).map((item) => item.title);
}

async function resolveImage(title) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url",
    origin: "*",
    titles: title,
  });
  const url = `https://wowpedia.fandom.com/api.php?${params.toString()}`;
  const response = await fetch(url, { headers });
  const json = await response.json();
  const page = Object.values(json?.query?.pages || {})[0];
  return page?.imageinfo?.[0]?.url || null;
}

for (const query of ["Horde symbol", "Alliance crest", "Alliance logo", "Horde logo"]) {
  console.log(`\n=== ${query} ===`);
  const titles = await searchFiles(query);
  for (const title of titles) {
    const image = await resolveImage(title);
    if (image) console.log(title, "=>", image);
  }
}

