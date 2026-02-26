const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Referer: "https://wowpedia.fandom.com/",
};

const searchParams = new URLSearchParams({
  action: "query",
  format: "json",
  list: "search",
  srnamespace: "6",
  srlimit: "25",
  origin: "*",
  srsearch: "Desolace",
});

const searchUrl = `https://wowpedia.fandom.com/api.php?${searchParams.toString()}`;
const searchResponse = await fetch(searchUrl, { headers });
const searchJson = await searchResponse.json();
const titles = (searchJson?.query?.search || []).map((item) => item.title);

for (const title of titles) {
  const infoParams = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url",
    origin: "*",
    titles: title,
  });
  const infoUrl = `https://wowpedia.fandom.com/api.php?${infoParams.toString()}`;
  const response = await fetch(infoUrl, { headers });
  const json = await response.json();
  const pages = json?.query?.pages || {};
  const page = Object.values(pages)[0];
  const imageUrl = page?.imageinfo?.[0]?.url || null;
  console.log(title, "=>", imageUrl || "MISSING");
}
