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
            // A choice name-class represents multiple possible element names.
            return "*";
        case "nsName":
            // Namespace-restricted wildcard: local name is unconstrained.
            return "*";
        case "anyName":
            // Full wildcard name-class.
            return "*";
        case "name":
            return toString(nameNode);
    }
}
