import fs from "node:fs/promises";
import util from "node:util";
import { toXml } from "xast-util-to-xml";
import { parseRelaxNgBasic } from "../src/relax-ng/parse-relax-ng";
import Prettier from "prettier";
import { unifiedXml } from "./utils";
import { removePositionPlugin } from "../src/xast-utils";
import { doSimplificationPlugin } from "../src/relax-ng/simplification/do-simplification-plugin";
import { makeTypesForGrammar } from "../src/relax-ng/typescript/make-type";

// Make console.log pretty-print by default
const origLog = console.log;
console.log = (...args) => {
    origLog(...args.map((x) => util.inspect(x, false, 10, true)));
};

type x = {
    foo: string;
    "bar": string;
    1: string;
}

describe("relax-ng-parse", () => {
    it("can parse RELAX-NG XML", async () => {
        const processor = unifiedXml()
            .use(removePositionPlugin)
            .use(doSimplificationPlugin);
        const source = await fs.readFile("./resources/pretext.rng", "utf-8");
        const parsed = processor.parse(source);
        const ast = processor.runSync(parsed);

        //const parsed = (parseRelaxNgBasic(source));
        console.log(makeTypesForGrammar(ast.children[0]));

        //const formatted = Prettier.format(toXml(parsed.children[0]!.children[2]), {"parser": "html"})
        //origLog(formatted)
    });
});
