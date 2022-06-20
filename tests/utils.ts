import { unified } from "unified";
import { fromXml } from "xast-util-from-xml";
import { toXml } from "xast-util-to-xml";

export function unifiedXml() {
    return unified()
        .use(function () {
            this.Parser = fromXml;
        })
        .use(function () {
            this.Compiler = toXml;
        });
}
