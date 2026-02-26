const candidates = [
  "File:The Barrens.jpg",
  "File:Barrens.jpg",
  "File:The Barrens loading screen.jpg",
  "File:Barrens loading screen.jpg",
  "File:The Barrens concept art.jpg",
  "File:The Barrens (Classic).jpg",
  "File:Northern Barrens.jpg",
  "File:The Barrens map.jpg",
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
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      Referer: "https://wowpedia.fandom.com/",
    },
  });
  const json = await response.json();
  const pages = json?.query?.pages || {};
  const page = Object.values(pages)[0];
  const imageUrl = page?.imageinfo?.[0]?.url || null;
  console.log(title, "=>", imageUrl || "MISSING");
}
