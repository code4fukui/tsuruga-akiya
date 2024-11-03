import { fetchOrLoad, HTMLParser, CSV, nextTag, prevTag, table2json, dl2json, table2csv, sleep } from "https://code4fukui.github.io/scrapeutil/scrapeutil.js";

const fn = "tsuruga-akiya.csv";
let url = "https://tsuruga-akiya.jp/property/";

const items = [];
for (let page = 2;; page++) {
  const html = await fetchOrLoad(url);
  const dom = HTMLParser.parse(html);

  const as = dom.querySelectorAll(".info_area a");
  const urls = as.map(i => i.getAttribute("href"));
  console.log(url, urls, urls.length);
  if (urls.length == 0) break;
  urls.forEach(i => items.push({ url: i }));

  url = `https://tsuruga-akiya.jp/property/page/${page}/`;
  await sleep(300);
}

for (const item of items) {
  const html = await fetchOrLoad(item.url);
  const dom = HTMLParser.parse(html);

  // タイトル
  const s = dom.querySelector("title").text;
  item.name = s.substring(0, s.length - " - つるが空き家インフォ".length);

  // 緯度経度
  const marker = dom.querySelector(".acf-map .marker");
  item.lat = marker.getAttribute("data-lat");
  item.lng = marker.getAttribute("data-lng");

  // その他データ
  const dl = dom.querySelector(".data_field_b dl");
  const json = dl2json(dl);
  Object.keys(json).forEach(i => item[i] = json[i]);

  console.log(item);
  await sleep(300);
}
await Deno.writeTextFile(fn, CSV.stringify(items));
