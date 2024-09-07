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

  private scrapeAll(): DiscoverListings[] {
    return [
      this.scrapeRecentlyUpdated(),
      // this.animeDiscover()[0],
      //  this.animeDiscover()[1],
    ];
  }

  private animeDiscover(): DiscoverListings[] {
      const $ = this.$;
      const animeDiscoverSec = $(".c-blog-listing.c-page__content.manga_content .col-12.col-md-6.badge-pos-1");
      const animeDiscoverItems: DiscoverListings[] = []; 
      let data: DiscoverListing[] = [];
      for(let anime of animeDiscoverSec) {
        const animeRef = $(anime);
        const titleElem = animeRef.find("a")
        const title = animeRef.find('a').get(0).attribs.title;
        let url = titleElem.get(0).attribs.href;
        let image: string | null | undefined = animeRef
          .find("a > img")
          .attr("srcset");
        image = image?.split(',').pop()!.split(' ')[1];
        
        if (image == undefined) {
          image = null;
        }
        let currentEpisode = animeRef.find('.chapter-item a.btn-link').text().split(' ')[1];
        let indicator = animeRef.find('.manga-vf-flag').text().trim();
        data.push({
          url: url.includes('https') ? url : this.baseName + url,
          titles: { primary: title },
          poster : image?.includes('https') ?  image : this.baseName + image,
          indicator,
          current: currentEpisode as unknown as number,
        } satisfies DiscoverListing);
        animeDiscoverItems.push({
          type: DiscoverTypes.GRID_3x,
          title: "Derniers épisodes",
          data
        });
      }
      return animeDiscoverItems;
  }

  private scrapeRecentlyUpdated(): DiscoverListings {
    const $ = this.$;
      const animeDiscoverSec = $(".c-blog-listing.c-page__content.manga_content .col-12.col-md-6.badge-pos-1");
      let data: DiscoverListing[] = [];
      for(let anime of animeDiscoverSec) {
        const animeRef = $(anime);
        const titleElem = animeRef.find("a")
        const title = animeRef.find('a').get(0).attribs.title;
        let url = titleElem.get(0).attribs.href;
        let image: string | null | undefined = animeRef
          .find("a > img")
          .attr("srcset");
        image = image?.split(',').pop()!.split(' ')[1];
        
        if (image == undefined) {
          image = null;
        }
        let currentEpisode = animeRef.find('.chapter-item a.btn-link').text().split(' ')[1];
        let indicator = animeRef.find('.manga-vf-flag').text().trim();
        data.push({
          url: url.includes('https') ? url : this.baseName + url,
          titles: { primary: title },
          poster : image?.includes('https') ?  image : this.baseName + image,
          indicator,
          current: currentEpisode as unknown as number,
        } satisfies DiscoverListing);
      }
      return {
        type: DiscoverTypes.GRID_3x,
        title: "Derniers épisodes",
        data
      };
  }
}
