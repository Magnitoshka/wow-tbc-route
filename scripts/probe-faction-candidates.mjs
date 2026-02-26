const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Referer: "https://wowpedia.fandom.com/",
};

const candidates = [
  "File:HordeCrest.png",
  "File:Horde Crest.png",
  "File:Horde crest.png",
  "File:Horde_symbol.png",
  "File:Horde symbol.png",
  "File:Horde.png",
  "File:AllianceCrest.png",
  "File:AllianceCrest.jpg",
  "File:Alliance crest.png",
  "File:Alliance crest.jpg",
];

for (const title of candidates) {
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
  const image = page?.imageinfo?.[0]?.url || null;
  console.log(`${title} => ${image || "MISSING"}`);
}

