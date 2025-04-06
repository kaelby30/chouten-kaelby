import { defineAll } from './utils/defineFunctions';
defineAll();

import { test } from 'vitest'
import HiAnimeModule from "../src/modules/hianime/hianime";

import { log, logEnabled } from "./utils/log"
logEnabled(true)

const source = new HiAnimeModule();

test("provides discover", async () => {
  log((await source.discover())[1].data[0])
})

test("provides search", async () => {
  log((await source.search("one piece", 1)).results[0])
})

test("provides media info", async () => {
   log((await source.info("https://hianimec.vercel.app/api/v2/hianime/anime/one-piece-100")))
})

 test("provides media list", async () => {
   log((await source.media("one-piece-100"))[0].pagination[0].items)
 })

test("provides sources", async () => {
   const episodeUrl = "https://hianimec.vercel.app/api/v2/hianime/episode/sources?animeEpisodeId=one-piece-100?ep=2241";
   log((await source.sources(episodeUrl))[0].sources)
})

 test("get streams", async () => {
   const episodeUrl = "https://hianimec.vercel.app/api/v2/hianime/episode/sources?animeEpisodeId=one-piece-100?ep=2241";
   log(await source.streams(episodeUrl))
 })
