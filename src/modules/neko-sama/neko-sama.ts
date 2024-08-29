import { HomeScraper } from "./scraper/homeScraper";
import {
  BaseModule,
  InfoData,
  SearchResult,
  VideoContent,
  MediaList,
  Status,
  MediaType,
  MediaStream,
  ModuleSettings,
  ModuleType,
  InputTypes,
  InputSetting,
  SourceList,
  DiscoverData,
  SeasonData,
  MediaInfo,
  SourceData,
  MediaDataType,
  SearchData,
} from "../../types";
import { load } from "cheerio";

export default class NekoSama extends BaseModule implements VideoContent {
  baseUrl = "https://neko-sama.fr";
  metadata = {
    id: "nekosama",
    name: "Neko-sama",
    iconPath:'./icons/neko-sama.png',
    author: "Kaelby",
    description: "Chouten module for Neko-sama",
    type: ModuleType.Source,
    subtypes: ["Anime"],
    version: "0.0.3",
  };

  settings: ModuleSettings = [
    {
      title: "General",
      settings: [
        {
          id: "Domain",
          label: "Domain",
          placeholder: "https://neko-sama.fr",
          defaultValue: "https://neko-sama.fr",
          value: "https://neko-sama.fr",
        } as InputSetting<InputTypes.URL>,
      ],
    },
  ];

  baseName: string = this.baseUrl; //this.getSettingValue("Domain");

  async discover(): Promise<DiscoverData> {
    return await new HomeScraper(this.baseName).scrape();
  }

  async search(query: string, page: number): Promise<SearchResult> {
    const VOSTFR = "https://neko-sama.fr/animes-search-vostfr.json";
    const VF = "https://neko-sama.fr/animes-search-vf.json";

    const resp = await request(`${VOSTFR}`, "GET");
    const resp2 = await request(`${VF}`, "GET");
    const data = JSON.parse(resp.body);
    const data2 = JSON.parse(resp2.body);
    let items = [];
    let totalPages = 1;
    
    if (query) {
      items = data.filter((item: any) => item.title.toLowerCase().includes(query.toLowerCase()) || item.others.toLowerCase().includes(query.toLowerCase()));
      items = items.concat(data2.filter((item: any) => item.title.toLowerCase().includes(query.toLowerCase()) || item.others.toLowerCase().includes(query.toLowerCase())));
    }
    items = items.map((item: any) => {
      return {
        url: item.url,
        titles: {
          primary: `${item.title} ${item.url.includes('vostfr') ? "VOSTFR" : "VF"}` ,
          secondary: item.others,
        },
        poster: this.baseName + item.url_image,
        indicator: item.url.includes('vostfr') ? "VOSTFR" : "VF",
        current: 0,
        total: parseInt(item.nb_eps.split(" ")[0]),
      } as SearchData;
    }, []);
    return {
      info: {
        pages: totalPages
      },
      results: items
    };
  }

  async info(_url: string): Promise<InfoData> {

    const resp = await request(`${_url}`, "GET");
    const $ = load(resp.body);

    const title = $("h1").text();
    const altTitles = $("small").text().split(", ");
    const description = $(".synopsis > p").text();
    const poster = $(".cover > img").attr("src");
    const banner = $("#head").css("background-image")?.replace(/url\((['"])?(.*?)\1\)/gi, '$2');
    const score = parseInt($(".item:contains('Score moyen')").text().split("\n")[3].split("/")[0]);
    const status = $(".item:contains('Status')").text().split(" ")[1];
    const startDate = $(".item:contains('Diffusion')").text().match(/\d+/)?.[0] ?? "0";

    return {
      titles: {
        primary: title,
        secondary: altTitles[0],
      },
      altTitles: altTitles,
      description: description,
      poster: poster ?? "",
      banner: banner,
      status: status == "Pas" ? Status.NOT_RELEASED : Status.UNKNOWN,
      rating: score,
      yearReleased: parseInt(startDate),
      mediaType: MediaType.EPISODES,
      seasons: [
        {
          name: title,
          url: _url,
          selected: true,
        } satisfies SeasonData,
      ],
    };
  }

  async media(_url: string): Promise<MediaList[]> {
    const resp = await request(`${_url}`, "GET");
    const $ = load(resp.body);
    let episodes = $(".episodes .col-lg-12");
    let title = $("h1").text();
    let episodesList: MediaInfo[] = [];
    episodes.each((_, episode) => {
      const episodeRef = $(episode);
      const episodeTitle = episodeRef.find("a").text();
      const episodeUrl = episodeRef.find("a").attr("href") ?? "";
      const episodeNumber = parseInt(episodeTitle.split(" - ").pop() ?? "0");
      episodesList.push({
        title: episodeTitle,
        url: episodeUrl,
        number: episodeNumber,
      });
    })

    return [
      {
        title,
        pagination: [
          {
            items: episodesList.reverse(),
          }
        ]
      }
    ] as MediaList[];
   
  }

  async sources(_url: string): Promise<SourceList[]> {
    
    const resp = await request(`${_url}`, "GET");
    const $ = load(resp.body);
    let servers: SourceData[] = [];
    let link = $("body").text().match(/https:\/\/fusevideo.io\/e\/[a-zA-Z0-9]+/g);
    if (link) {
      servers.push({
        name: "FuseVideo",
        url: link[0],
      });
    }
    return [
      {
        title: "Neko-sama",
        sources: servers,
      } satisfies SourceList,
    ];
  }

  async streams(_url: string): Promise<MediaStream> {
    const resp = await request(_url, "GET");
    const $ = load(resp.body);
   const script = $('head').find('script')
      .map((_, elem) => $(elem).attr('src'))
      .get()
      .find((src) => src?.
        includes("https://fusevideo.io/f"));

    if (!script) {
      throw new Error("No script found");
    }
    const linkScript = await request(script, "GET");
    let videoLinkJSON = linkScript.body.match(/atob\("([^"]+)"\)/gm)?.[0];
    videoLinkJSON = videoLinkJSON?.replace('atob("','').replace('")','');
    videoLinkJSON = atob(videoLinkJSON!);
    videoLinkJSON = videoLinkJSON?.replace(/\\|\\|\\|/,"").slice(32)
    let json = JSON.parse(videoLinkJSON!);
    let sources: SourceData[] = [];
    for (let key in json) {
      if (typeof json[key] === 'string' && json[key].startsWith('https://fusevideo.io/m/')) {
        sources.push({
          name: "MP4",
          url: json[key],
        });
      }
  }
    return {
      skips: [],
      streams: sources.map((source) => {
        return {
          quality: source.name,
          file: source.url,
          type: MediaDataType.MP4,
        };
      }),
      subtitles: [],
      previews: [],
    };
    } 
}
