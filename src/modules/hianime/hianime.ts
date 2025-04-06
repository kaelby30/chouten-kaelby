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
    MediaInfo,
    MediaDataType,
    SkipData,
    SubtitleData,
    MediaPreview,
    MediaItem,
    SubtitleType,
  } from "../../types";


interface Episode {
  episodeId: string;
  title?: string;
  number: number;
  img?: string;
}

interface AnimeListItem {
  id: string;
  name: string;
  jname?: string;
  description?: string;
  poster?: string;
  rank?: number;
  rating?: string | number;
  episodes?: {
    sub?: number;
  };
}

export default class Hianime extends BaseModule implements VideoContent {
  baseUrl = "https://hianimec.vercel.app/";
  metadata = {
    id: "hianime",
    name: "Hianime",
    author: "50/50",
    description: "Chouten module for HiAnime.",
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
        placeholder: "https://hianimec.vercel.app/",
        defaultValue: "https://hianimec.vercel.app/",
        value: "https://hianimec.vercel.app/"
        } as InputSetting<InputTypes.URL>,
      ],
    },
  ];

  baseName: string = this.baseUrl;
  
  async discover(): Promise<DiscoverData> {
    const data: DiscoverData = [];
    const url = ("".concat(this.baseUrl, "api/v2/hianime/home"));
    console.log("URL:", url);
    const resp = await request(url, "GET");
    const json = JSON.parse(resp.body);

    // Spotlight Anime
    data.push({
        data: json.data.spotlightAnimes.map((item: AnimeListItem) => ({
            url: "".concat(this.baseUrl, "api/v2/hianime/anime/").concat(item.id),
            titles: {
                primary: item.name,
                secondary: item.jname || item.name
            },
            description: item.description || "",
            poster: item.poster || "",
            indicator: String(item.rank || 0),
            current: item.episodes?.sub || 0,
            total: item.episodes?.sub || 0,
            label: {}
        })),
        title: "Spotlight Anime",
        type: 0
    });

    // Trending Animes
    data.push({
        data: json.data.trendingAnimes.map((item: AnimeListItem) => ({
            url: "".concat(this.baseUrl, "api/v2/hianime/anime/").concat(item.id),
            titles: {
                primary: item.name,
                secondary: item.jname || item.name
            },
            description: item.name || "",
            poster: item.poster || "",
            indicator: String(item.rank || 0),
            current: item.episodes?.sub || 0,
            total: item.episodes?.sub || 0,
            label: {}
        })),
        title: "Currently Trending",
        type: 2
    });

    // Top Airing Animes
    data.push({
        data: json.data.topAiringAnimes.map((item: AnimeListItem) => ({
            url: "".concat(this.baseUrl, "api/v2/hianime/anime/").concat(item.id),
            titles: {
                primary: item.name,
                secondary: item.jname || item.name
            },
            description: item.name || "",
            poster: item.poster || "",
            indicator: String(item.rank || 0),
            current: item.episodes?.sub || 0,
            total: item.episodes?.sub || 0,
            label: {}
        })),
        title: "Top Airing",
        type: 2
    });

    // Most Popular Animes
    data.push({
        data: json.data.mostPopularAnimes.map((item: AnimeListItem) => ({
            url: "".concat(this.baseUrl, "api/v2/hianime/anime/").concat(item.id),
            titles: {
                primary: item.name,
                secondary: item.jname || item.name
            },
            description: item.name || "",
            poster: item.poster || "",
            indicator: String(item.rank || 0),
            current: item.episodes?.sub || 0,
            total: item.episodes?.sub || 0,
            label: {}
        })),
        title: "Most Popular",
        type: 2
    });
    return data;
  }

  async search(query: string, page: number): Promise<SearchResult> {
    const resp = await request(
      "".concat(this.baseName, "api/v2/hianime/search?q=") + encodeURIComponent(query),
      "GET"
    );
    const json = await JSON.parse(resp.body);
    return {
      info: {
        pages: page,
        count: json.data.animes.length,
        next: undefined
      },
      results: json.data.animes.map((item: AnimeListItem) => ({
        url: "".concat(this.baseName, "api/v2/hianime/anime/").concat(item.id),
        titles: {
          primary: item.name ?? item.jname ?? "",
          secondary: item.jname ?? item.name ?? "",
        },
        poster: item.poster ?? "",
        indicator: String(item.rating ?? "N/A"),
        current: item.episodes?.sub ?? 0,
        total: item.episodes?.sub ?? 0,
        status: Status.UNKNOWN,
        type: MediaType.EPISODES
      }))
    };
  }

  async info(url: string): Promise<InfoData> {
    console.log(url);
            const resp = await request(url, "GET");
            const json = JSON.parse(resp.body);
            if (json?.data?.anime?.info) {
                const animeInfo = json.data.anime.info;
                const returnValue: InfoData = {
                    titles: {
                        primary: animeInfo.name ?? animeInfo.japanese ?? animeInfo.name,
                        secondary: animeInfo.japanese ?? animeInfo.name ?? animeInfo.name
                    },
                    altTitles: [],
                    description: animeInfo.description ?? "No description found.",
                    poster: animeInfo.poster ?? "",
                    banner: animeInfo.banner ?? animeInfo.coverImage ?? "",
                    status: json.data.anime.moreInfo?.status ?? "Not Released",
                    yearReleased: json.data.anime.moreInfo?.aired ?? 2024,
                    rating: 0,
                    mediaType: MediaType.EPISODES,
                    seasons: [
                        {
                            name: "sub",
                            url: animeInfo.id,
                            selected: true
                        }
                    ],
                };
                return returnValue;
            }
            console.error("Invalid response format", json);
            return {} as InfoData;
  }

  async media(url: string): Promise<MediaList[]> {
    var _a, _b;
            const id = url;
            console.log("URL:", "".concat(this.baseName, "api/v2/hianime/anime/").concat(id, "/episodes"));
            const resp = await request("".concat(this.baseName, "api/v2/hianime/anime/").concat(id, "/episodes"), "GET");
            const json = JSON.parse(resp.body);

            const result: MediaList = {
                title: "Episodes",
                pagination: []
            };

            if (json.success && json.data && json.data.episodes) {
                const providerId = "hianime";
                const items: MediaInfo[] = [];

                for (const item of json.data.episodes as Episode[]) {
                    const episodeUrl = ("".concat(this.baseName, "api/v2/hianime/episode/sources?animeEpisodeId=").concat(item.episodeId));
                    console.log(episodeUrl);

                    items.push({
                        title: (_a = item.title) != null ? _a : "Episode ".concat(String(item.number)),
                        number: item.number,
                        url: episodeUrl,
                        thumbnail: (_b = item.img) != null ? _b : void 0
                    });
                }

                result.pagination.push({
                    id: "".concat(id, "-").concat(providerId),
                    title: "".concat(id, "-").concat(providerId),
                    items
                });
            } else {
                console.log("Error: Invalid response or no episodes found.");
            }
            return [result];
  }

  async sources(url: string): Promise<SourceList[]> {
    const sources = [
        {
            name: "Default",
            url
        }
    ];
    return [
        {
            title: "HiAnime",
            sources
        }
    ];
}

  async streams(url: string): Promise<MediaStream> {
    const data: MediaStream = {
        streams: [] as MediaItem[],
        skips: [] as SkipData[],
        subtitles: [] as SubtitleData[],
        previews: [] as MediaPreview[],
    };
    const resp = await request(url, "GET", {
        "Referer": "https://megacloud.club/"
    });
    const json = await JSON.parse(resp.body);

    if (json.success && json.data) {
        if (json.data.intro && json.data.intro.end > 0) {
            data.skips.push({
                title: "Intro",
                start: json.data.intro.start,
                end: json.data.intro.end
            });
        }

        if (json.data.outro && json.data.outro.end > 0) {
            data.skips.push({
                title: "Outro",
                start: json.data.outro.start,
                end: json.data.outro.end
            });
        }

        if (json.data.sources) {
            for (const source of json.data.sources) {
                data.streams.push({
                    file: source.url,
                    quality: source.type,
                    type: MediaDataType.HLS
                });
            }
        }

        if (json.data.tracks) {
            for (const subtitle of json.data.tracks) {
                if (subtitle.kind === "captions") {
                    data.subtitles.push({
                        url: subtitle.file,
                        language: subtitle.label,
                        type: SubtitleType.VTT
                    });
                }
            }
        }
    }
    return data;
  }
}
