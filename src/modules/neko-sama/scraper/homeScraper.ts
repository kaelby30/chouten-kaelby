import * as cheerio from "cheerio";
import {
  DiscoverData,
  DiscoverListing,
  DiscoverListings,
  DiscoverTypes,
  Response
} from '../../../types'

export class HomeScraper {
  $!: cheerio.Root;
  // page: number;
  baseName: string;

  constructor(baseName: string) {
    this.baseName = baseName;
    // this.page = 1;
  }

  async scrape(): Promise<DiscoverData> {
    const html: Response = await request(`${this.baseName}`, "GET")

    this.$ = cheerio.load(html.body);

    return this.scrapeAll();
  }

  // Note sure if/how I add "Top anime",
  // as it has "Day/Week/Month" selectors
  private scrapeAll(): DiscoverListings[] {
    return [
      this.scrapeRecentlyUpdated(),
       this.animeDiscover()[0],
       this.animeDiscover()[1],
    ];
  }

  private animeDiscover(): DiscoverListings[] {
      const $ = this.$;
      const animeDiscoverSec = $("div.row.no-gutters:nth-last-child(-n+3)");
      const animeDiscoverItems: DiscoverListings[] = []; 
      animeDiscoverSec.each((_i, category) => {
          let titleCategory = $(category).find('h1.nekosama.header').text().replaceAll('\n','');
          let animeItems = $(category).find('div.text-left');
          let data: DiscoverListing[] = [];
          animeItems.each((_i, item) => {
              let title = $(item).find('a .title').text();
              let url = $(item).find('a').attr('href');
              let image = $(item).find('img.lazy').attr('data-src');
              data.push({
                  url : url ?? "",
                  titles: { primary: title },
                  poster: image ?? "",
              } satisfies DiscoverListing);
          });
          animeDiscoverItems.push({
            type: DiscoverTypes.GRID_3x,
            title: titleCategory,
            data: data,
        } satisfies DiscoverListings);
      }
      );
      return animeDiscoverItems;
  }

  private scrapeRecentlyUpdated(): DiscoverListings {
    const $ = this.$;
    const recentUpdatesSec = $("#home > div > div.row.no-gutters.js-last-episode-container > div:nth-child(n)");
    const recentlyUpdatedItems: DiscoverListing[] = recentUpdatesSec
      .map((_i, anime) => {
        const animeRef = $(anime);
        const titleElem = animeRef.find("a")
        const title = animeRef.find('a.title .limit').text();
        let url = titleElem.attr("href")!.replace('episode','info')
        url = url.substring(0, url.lastIndexOf('-')) + url.substring(url.lastIndexOf('_'))
        let image: string | null | undefined = animeRef
          .find("a > img")
          .attr("src");
        if (image == undefined) {
          image = null;
        }
        let currentEpisode = animeRef.find('a.title .episode').text();
        return {
          url: this.baseName + url,
          titles: { primary: title },
          poster: image?.includes('https') ?  image : this.baseName + image,
          description: undefined,
          indicator : currentEpisode,
          current: currentEpisode.split('Ep. ')[1] as unknown as number,
        } satisfies DiscoverListing;
      })
      .get();
    return {
      type: DiscoverTypes.GRID_3x,
      title: "Derniers épisodes",
      data: recentlyUpdatedItems,
    } satisfies DiscoverListings;
  }
}
