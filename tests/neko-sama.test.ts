import { defineAll } from './utils/defineFunctions';
defineAll();

import { test } from 'vitest'
import NekoSamaModule from "../src/modules/neko-sama/neko-sama";

import { log, logEnabled } from "./utils/log"
logEnabled(true)

const source = new NekoSamaModule();

 test("provides discover", async () => {
   log((await source.discover())[1].data[0])
 })


test("provides search", async () => {
     log((await source.search("your name", 1)).results[0]
    )
})

 test("provides media info", async () => {
      log((await source.info("https://neko-sama.fr/anime/info/19554-yozakura-san-chi-no-daisakusen_vostfr")))
 })

 test("provides media list", async () => {
    log((await source.media("https://neko-sama.fr/anime/info/19554-yozakura-san-chi-no-daisakusen_vostfr"))[0].pagination[0].items)
  })

  test("provides sources", async () => {
    log((await source.sources("https://neko-sama.fr/anime/episode/20637-fairy-tail-100-years-quest-05_vostfr"))[0].sources)
  })

 test("get streams", async () => {
      log((await source.streams("https://fusevideo.io/e/kn0Omm573mdg98Q")))

  })
