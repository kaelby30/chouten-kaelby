import { readdir,rmdir } from "node:fs/promises";
import * as Bun from "bun";
import { $ } from "bun";
import AdmZip from "adm-zip";
import log from 'log';

console.log = log.info;
console.error = log.error;
console.warn = log.warn;
console.info = log.info;
console.debug = log.debug;

interface Metadata {
    url: string;
    title: string;
    iconPath: string;
    id: string;
    author: string;
    description: string;
    modules?: Module[];
}

interface Module {
    name: string;
    version: string;
    iconPath: string;
    id: string;
    subtypes: string[];
    filePath: string;
}
let metadata : Metadata = 
    {
    url: "https://kaelby30.github.io/chouten-kaelby",
    title: "Kealby's Modules",
    iconPath: "./icons/icon.png",
    id: "kealby",
    author: "Kealby",
    description: "Chouten modules from Kealby",
    modules: [] as Module[]
}

async function buildModules() {
    const modulesDir = await readdir("./src/modules", { withFileTypes: true });
    for (const module of modulesDir) {
        if (module.isDirectory()) {
            // run esbuild ./src/neko-sama/neko-sama.ts --bundle --target=safari11 --outfile=code.js --global-name=source but with the module name
            await $`bun esbuild ./src/modules/${module.name}/${module.name}.ts --bundle --target=safari11 --outfile=./dist/modules/${module.name}/code.js --global-name=source`;
            log.info("Copying icon file")
            await $`cp ./icons/${module.name}.png ./dist/modules/${module.name}/icon.png && echo "Copied icon.png file"`;
            await $`echo "Building module ${module.name}"`;
            const moduleFile = Bun.file(`./dist/modules/${module.name}/code.js`);
            const moduleContent = await moduleFile.text();
            const zip = new AdmZip();
            zip.addLocalFolder(`./dist/modules/${module.name}`);
            zip.writeZip(`./dist/modules/${module.name}.module`);
            await $`echo "Built module ${module.name}"`;
            await $`bun -e "${moduleContent}; let instance = new source.default(); console.log(JSON.stringify(instance.metadata))" > ./dist/modules/${module.name}/metadata.json && echo "Module Metadata file created"`;
            const metadataModule = JSON.parse(await Bun.file(`./dist/modules/${module.name}/metadata.json`).text());
            metadata.modules!.push({
                name: module.name,
                version: metadataModule.version,
                iconPath: `./icons/${module.name}.png`,
                id: metadataModule.id,
                subtypes: metadataModule.subtypes,
                filePath: `./dist/modules/${module.name}.module`
            });
           await rmdir(`./dist/modules/${module.name}`, { recursive: true });
        }
        await $`echo "Built all modules"`;
    }
}


async function createMetadataFile() {
    log.info("Building modules");
    await buildModules();
    await Bun.write("metadata.json", JSON.stringify(metadata));
    $`echo "Repo Metadata file created"`;    
}

createMetadataFile();
