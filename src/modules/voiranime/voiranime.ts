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
  SubtitleType,
  SubtitleData,
  SearchData,
} from "../../types";
import { load } from "cheerio";

export default class VoirAnime extends BaseModule implements VideoContent {
  baseUrl = "https://voiranime.com";
  metadata = {
    id: "voiranime",
    name: "VoirAnime",
    iconPath: "./icons/voiranime.png",
    author: "Kaelby",
    description: "Chouten module for VoirAnime,only stape works for now on the apps",
    type: ModuleType.Source,
    subtypes: ["Anime"],
    version: "0.0.1",
  };

  settings: ModuleSettings = [
    {
      title: "General",
      settings: [
        {
          id: "Domain",
          label: "Domain",
          placeholder: "https://voiranime.com",
          defaultValue: "https://voiranime.com",
          value: "https://voiranime.com",
        } as InputSetting<InputTypes.URL>,
      ],
    },
  ];

  baseName: string = this.baseUrl; //this.getSettingValue("Domain");

  async discover(): Promise<DiscoverData> {
    return await new HomeScraper(this.baseName).scrape();
  }

  async search(query: string, page: number): Promise<SearchResult> {
    const url = `${this.baseName}/?s=${query}&post_type=wp-manga&paged=${page}`;

    const resp = await request(url, "GET");
    const $ = load(resp.body);
    let items: SearchData[] = [];

    $(".c-tabs-item__content").each((_, elem) => {
      const itemRef = $(elem);
      const title = itemRef.find(".h4").text().trim();
      const url = itemRef.find("a").attr("href") ?? "";
      const poster = itemRef.find("img").attr("src") ?? "";
      const indicator = itemRef.find(".manga-vf-flag").text().includes('VF') ? "VF" : "VOSTFR";
      items.push({
        url,
        titles: {
          primary: title,
        },
        poster,
        indicator,
      });
    });

    let totalPages = parseInt(
      $("a.last").attr("href")?.split("/page/")[1].split("/")[0] ?? "1"
    );
    return {
      info: {
        pages: totalPages,
      },
      results: items,
    };
}

  async info(_url: string): Promise<InfoData> {
    let status: Status = Status.UNKNOWN;
    const resp = await request(`${_url}`, "GET");
    const $ = load(resp.body);
    let title = $(".post-title").text().trim();
    let description = $(".description-summary").text().trim();
    let poster = $(".summary_image img").attr("srcset");
    poster = poster?.split(",").pop()!.split(" ")[1];
    let banner = poster;
    let score = parseFloat($(".post-rating").text());
    let altTitles: string[] = [];
    let altTitle = $(".summary-heading:contains('Romaji')")
      .next()
      .text()
      .trim();
    if (altTitle !== "") {
      altTitles.push(altTitle);
    }
    altTitle = $(".summary-heading:contains('English')").next().text().trim();
    if (altTitle !== "") {
      altTitles.push(altTitle);
    }
    altTitle = $(".summary-heading:contains('Native')").next().text().trim();
    if (altTitle !== "") {
      altTitles.push(altTitle);
    }
    let stringStatus = $(".summary-heading:contains('Status')")
      .next()
      .text()
      .trim() as string;
    let startDate = $(".summary-heading:contains('Start date')")
      .next()
      .text()
      .trim()
      .split(",")[1] as string;
    let episodes = $("listing-chapters_wrap cols-1 ul li")
      .map((_, elem) => $(elem).text())
      .get();
    let episodesList: MediaInfo[] = [];
    $(episodes).each((_: any, episode: any) => {
      const episodeRef = $(episode);
      const episodeTitle = episodeRef.find("a").text();
      const episodeUrl = episodeRef.find("a").attr("href") ?? "";
      const episodeNumber = parseInt(episodeTitle.split(" - ").pop() ?? "0");
      episodesList.push({
        title: episodeTitle,
        url: episodeUrl,
        number: episodeNumber,
      });
    });

    switch (stringStatus) {
      case "EN COURS":
        status = Status.CURRENT;
        break;
      case "TERMINÉ":
        status = Status.COMPLETED;
        break;
      case "ABANDONNÉ":
        status = Status.HIATUS;
        break;
      case "PROCHAINEMENT":
        status = Status.NOT_RELEASED;
        break;
      default:
        status = Status.UNKNOWN;
        break;
    }

    return {
      titles: {
        primary: title,
        secondary: altTitles[0],
      },
      altTitles: altTitles,
      description: description,
      poster: poster ?? "",
      banner: banner,
      status,
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
    let episodes = $(".wp-manga-chapter");
    let title = $("h1").text();
    let episodesList: MediaInfo[] = [];
    episodes.each((_, episode) => {
      const episodeRef = $(episode);
      const episodeTitle = episodeRef.find("a").text().trim();
      const episodeUrl = episodeRef.find("a").attr("href") ?? "";
      let episodeNumber;
      if (episodeTitle.includes("FILM")) {
        episodeNumber = 1;
      } else {
        episodeNumber = parseInt(episodeTitle.split(" ").pop() ?? "0");
      }
      episodesList.push({
        title: episodeTitle,
        url: episodeUrl,
        number: episodeNumber,
      });
    });

    return [
      {
        title,
        pagination: [
          {
            items: episodesList.reverse(),
          },
        ],
      },
    ] as MediaList[];
  }

  async sources(_url: string): Promise<SourceList[]> {
    const resp = await callWebview(_url, "GET");
    const $ = load(resp.body);
    let iframe = $("iframe").attr("src");
    let url = new URL(_url);
    return [
      {
        title: "VoirAnime",
        sources: [
          {
            name: url.origin,
            url: iframe ?? "",
          },
        ],
      },
    ];
  }

  async streams(_url: string): Promise<MediaStream> {
    if (_url.includes("vidmoly")) {
      const resp = await request(_url, "GET");
      const $ = load(resp.body);
      for (let script of $("script").toArray()) {
        let scriptContent = $(script).html();
        if (scriptContent && scriptContent.includes("player.setup")) {
          let match = scriptContent.match(/player\.setup\((.*?)\);/s);
          if (match) {
            let setupContent = match[1];
            let sourcesMatch = setupContent.match(/sources:\s*(\[.*?\])/s);
            if (sourcesMatch) {
              let trackMatches = setupContent.match(/tracks:\s*(\[.*?\])/s);
              if (trackMatches) {
                let subtitlesArray = trackMatches[1];
                let tracks = eval(subtitlesArray);
                let subtitles : SubtitleData[] = tracks.map((track: any) => {
                  if (track.kind === "captions") {
                    return {
                      url: track.file.startsWith('https') ? track.file : `https://vidmoly.to${track.file}`,
                      language: track.label,
                      type: SubtitleType.VTT,
                    };
                  } else {
                    return {
                      url: track.file.startsWith('https') ? track.file : `https://vidmoly.to${track.file}`,
                      language: "thumbnails",
                      type: SubtitleType.VTT,
                    };
                  }
                });

                try {
                  let arrayContent = sourcesMatch[1];
                  let sourceMatches = arrayContent.match(
                    /file:\s*['"](.*?)['"]/
                  )!;
                  let sources: SourceData[] = [];
                  let m3u8Resp = await request(sourceMatches[1], "GET", {
                    referer: _url,
                  });
                  let m3u8 = m3u8Resp.body;
                  if (m3u8.includes("EXTM3U")) {
                    const videoList = m3u8.split("#EXT-X-STREAM-INF:");
                    for (const video of videoList ?? []) {
                      if (!video.includes("m3u8")) continue;
                      const url = video.split("\n")[1];
                      const quality = video
                        .split("RESOLUTION=")[1]
                        .split(",")[0]
                        .split("x")[1];
                      sources.push({
                        name: quality,
                        url: url,
                      });
                    }
                  }
                  return {
                    skips: [],
                    streams: sources.map((source) => {
                      return {
                        quality: source.name,
                        file: source.url,
                        type: MediaDataType.HLS,
                      };
                    }),
                    subtitles,
                    previews: [],
                  };
                } catch (e) {
                  console.error("Error parsing sources:", e);
                }
              }
            }
            break;
          }
        }
      }
    } else if (_url.includes("streamtape")) {
      let streamtapeUrl = _url.replace("streamtape.com", "streamta.pe");
      console.log(streamtapeUrl);
      const streamtapeResp = await request(streamtapeUrl, "GET");
      const streamtape = load(streamtapeResp.body);
      let [fh, sh] = streamtape
        .html()
        ?.match(/robotlink'\).innerHTML = (.*)'/)![1]
        .split("+ ('");
      sh = sh.substring(3);
      fh = fh.replace(/\'/g, "");
      const url = `https:${fh}${sh}`;
      return {
        skips: [],
        streams: [
          {
            quality: "Default",
            file: url,
            type: MediaDataType.MP4,
          },
        ],
        subtitles: [],
        previews: [],
      };
    }
    return {
      skips: [],
      streams: [],
      subtitles: [],
      previews: [],
    };
  }
}
