import { toString } from "xast-util-to-string";
import {
    NGSimpElement,
    NGSimpPattern,
} from "../simplification/simplified-types";

/**
 * Extract the name from an `<attribute>` or `<element>` tag.
 */
export function extractName(
    elm: (NGSimpPattern | NGSimpElement) & { name: "attribute" | "element" }
) {
    const nameNode = elm.children[0];
    switch (nameNode.name) {
        case "choice":
        case "nsName":
        case "anyName":
            throw new Error(
                `Extracting a name from a <${nameNode.name}> element is not supported`
            );
        case "name":
            return toString(nameNode);
    }
}
