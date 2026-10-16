// Создаёт настоящие статические HTML-страницы для каждого товара после сборки.
// Благодаря этому у карточек есть собственные title, description, canonical и Product-разметка
// уже в исходном HTML, до выполнения React в браузере.

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = "https://cmbcgebjssfzevxohrtl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_g9MY0VJFrYsbrMy8SE0hMw_GV9EnHnf";
const SITE_URL = "https://3dyyc.github.io";
const DIST_DIR = "dist";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function replaceMeta(html, attribute, key, content) {
  const escapedContent = escapeHtml(content);
  const tag = `<meta ${attribute}="${key}" content="${escapedContent}" />`;
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}=["']${key}["'][^>]*>`, "i");
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n</head>`);
}

function replaceCanonical(html, url) {
  const tag = `<link rel="canonical" href="${escapeHtml(url)}" />`;
  const pattern = /<link\s+rel=["']canonical["'][^>]*>/i;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n</head>`);
}

async function generate() {
  const templatePath = join(DIST_DIR, "index.html");
  let template;
  try {
    template = readFileSync(templatePath, "utf8");
  } catch {
    console.warn("Не найден dist/index.html — пропускаем создание HTML-страниц товаров.");
    return;
  }

  let products = [];
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id%2Cname%2Cdescription%2Cimages%2Cprice%2Csale%2Cin_stock%2Cqty%2Crating%2Creviews_count`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    });
    if (!response.ok) throw new Error(`Supabase вернул ${response.status}: ${await response.text()}`);
    products = await response.json();
  } catch (error) {
    console.warn("Не удалось получить товары для статических SEO-страниц:", error.message);
    return;
  }
  for (const product of products) {
    if (product.id == null || !product.name) continue;

    const id = String(product.id);
    const productUrl = `${SITE_URL}/product/${encodeURIComponent(id)}`;
    const title = `${product.name} — 3D Уус`;
    const description = String(product.description || `${product.name} — изделие из 3D-печати в мастерской 3D Уус.`)
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
    const images = Array.isArray(product.images) && product.images.length
      ? product.images.map((image) => new URL(image, SITE_URL).href)
      : [`${SITE_URL}/icon-512.png`];
    const basePrice = Number(product.price) || 0;
    const discount = Number(product.sale) || 0;
    const price = Math.max(0, Math.round(basePrice * (1 - discount / 100)));
    const inStock = product.in_stock !== false && (product.qty == null || Number(product.qty) > 0);

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": description,
      "image": images,
      "sku": id,
      "brand": { "@type": "Brand", "name": "3D Уус" },
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "RUB",
        "price": price.toFixed(2),
        "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    };
    if (Number(product.rating) > 0 && Number(product.reviews_count) > 0) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": Number(product.rating).toFixed(1),
        "reviewCount": Number(product.reviews_count)
      };
    }

    let html = template.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    html = replaceMeta(html, "name", "description", description);
    html = replaceMeta(html, "property", "og:type", "product");
    html = replaceMeta(html, "property", "og:title", title);
    html = replaceMeta(html, "property", "og:description", description);
    html = replaceMeta(html, "property", "og:url", productUrl);
    html = replaceMeta(html, "property", "og:image", images[0]);
    html = replaceMeta(html, "name", "twitter:title", title);
    html = replaceMeta(html, "name", "twitter:description", description);
    html = replaceMeta(html, "name", "twitter:image", images[0]);
    html = replaceCanonical(html, productUrl);
    html = html.replace("</head>", `  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>\n</head>`);

    const outputDir = join(DIST_DIR, "product", encodeURIComponent(id));
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(join(outputDir, "index.html"), html, "utf8");
  }

  console.log(`Создано статических SEO-страниц товаров: ${products.length}.`);
}

generate().catch((error) => {
  console.warn("Ошибка генерации SEO-страниц товаров:", error.message);
});
