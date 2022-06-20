import { NGSimpElement } from "../simplification/simplified-types";
import { extractAttributes } from "./extract-attributes";
import { extractRefs, textChildrenAllowed } from "./extract-children";
import { extractName } from "./extract-name";

let i=0;

export function extractElementType(elm: NGSimpElement) {
    const name = extractName(elm);
    const attributes = extractAttributes(elm);
    let children = extractRefs(elm.children[1]).map((ref) => ({
        ref: ref.attributes.name,
    }));
    children.sort((a, b) => a.ref.localeCompare(b.ref));
    // Filter out multiple copies of the same child.
    const childRefs: Set<string> = new Set([]);
    children = children.filter((n) => {
        if (childRefs.has(n.ref)) {
            return false;
        }
        childRefs.add(n.ref);
        return true;
    });

    const textChildren = textChildrenAllowed(elm.children[1]);
    //if (name === "ElementAuthor" || name === "author") {
    //    console.log(i++,elm)
    //}

    return {
        type: "element",
        name,
        attributes,
        children,
        textChildrenAllowed: textChildren,
    };
}

export type ElementTypeDescriptor = ReturnType<typeof extractElementType>;
