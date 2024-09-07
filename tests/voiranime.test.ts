import { defineAll } from "./utils/defineFunctions";
defineAll();

import { test } from "vitest";
import VoirAnimeModule from "../src/modules/voiranime/voiranime";

import { log, logEnabled } from "./utils/log";
logEnabled(true);

const source = new VoirAnimeModule();

//  test("provides discover", async () => {
//    log((await source.discover()))
//  })

// test("provides search", async () => {
//      log(((await source.search("b", 1)).info.pages)
//     )
// })

// test("provides media info", async () => {
//     log((await source.info("https://v5.voiranime.com/anime/kimi-no-na-wa/")))
// })

//  test("provides media list", async () => {
//     log((await source.media("https://v5.voiranime.com/anime/senpai-is-an-otokonoko/"))[0].pagination[0].items)
//   })

// test("provides sources", async () => {
//   log(
//     (
//       await source.sources(
//         "https://v5.voiranime.com/anime/twilight-outfocus/twilight-outfocus-10-vostfr/"
//       )
//     )[0].sources
//   );
// });

test("get streams", async () => {
  log(await source.streams("https://streamtape.com/e/wybPwxk6OMHJ3aY"));
});
