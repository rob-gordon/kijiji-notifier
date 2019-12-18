import cheerio from "cheerio";
import { TListing } from "./types";

export async function fetchListings(endpoint: string, lastId?: string) {
  // Get listings
  const res = await fetch(`https://cors-anywhere.herokuapp.com/${endpoint}`, {
    method: "GET"
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  let ids = $("[data-listing-id]")
    .map((_index, el) => {
      return $(el).data("listing-id");
    })
    .get();

  // Only new listings
  if (lastId && ids.includes(lastId)) {
    ids = ids.slice(0, ids.indexOf(lastId));
  }

  // Parse relevant data and link
  const data: TListing[] = ids.map((id: string) => {
    const listing = $(`[data-listing-id=${id}]`);
    const title = $(listing)
      .find("a.title")
      .text()
      .trim();
    const link = $(listing)
      .find("a.title")
      .attr("href");
    const description = $(listing)
      .find("div.description")
      .text()
      .trim();
    const image = $(listing)
      .find("div.image img")
      .attr("src");
    const price = parseInt(
      $(listing)
        .find("div.price")
        .text()
        .trim()
        .split(",")[0]
        .replace(/[^\d]/gi, "")
    );
    return {
      id,
      title,
      link,
      description,
      image,
      price
    };
  });

  return data;
}
