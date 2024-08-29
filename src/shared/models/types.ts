import { SubtitleData } from "../../types";

export interface dictStringAny {
    [x: string]: any
}

export interface IVideo {
    /**
     * The **MAIN URL** of the video provider that should take you to the video
     */
    url: string;
    /**
     * The Quality of the video should include the `p` suffix
     */
    quality?: string;
    /**
     * make sure to set this to `true` if the video is hls
     */
    isM3U8?: boolean;
    /**
     * set this to `true` if the video is dash (mpd)
     */
    isDASH?: boolean;
    /**
     * size of the video in **bytes**
     */
    size?: number;
    [x: string]: unknown; // other fields
}

export interface ISubtitle {
    /**
     * The id of the subtitle. **not** required
     */
    id?: string;
    /**
     * The **url** that should take you to the subtitle **directly**.
     */
    url: string;
    /**
     * The language of the subtitle
     */
    lang: string;
}


export interface ISource {
    headers?: Record<string, string>;
    subtitles?: SubtitleData[];
    videos: IVideo[];
    download?: string;
    embedURL?: string;
}