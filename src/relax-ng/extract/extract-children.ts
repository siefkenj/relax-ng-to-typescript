import { EXIT, visit } from "unist-util-visit";
import { Element as XMLElement } from "xast";
import { elmMatcher, isElement } from "../../xast-utils";
import {
    NGSimpNonEmptyPattern,
    NGSimpPattern,
    NGSimpRef,
    NGSimpTop,
} from "../simplification/simplified-types";

/**
 * List all children of `elm` that are `NGSimpRef`s.
 */
export function extractRefs(elm: NGSimpTop): NGSimpRef[] {
    const ret: NGSimpRef[] = [];
    visit(elm, elmMatcher("ref"), (node) => {
        ret.push(node);
    });
    return ret;
}

/**
 * Determines if XML Text elements are allowed as children.
 */
export function textChildrenAllowed(elm: NGSimpTop): boolean {
    if (elm.name === "notAllowed") {
        return false;
    }
    const filtered = filterRefs(elm);
    let ret = false;
    visit({ type: "root", children: filtered }, elmMatcher("text"), () => {
        ret = true;
        return EXIT;
    });

    return ret;
}

const isAttribute = elmMatcher("attribute");
const isName = elmMatcher("name");
const isAnyName = elmMatcher("anyName");
const isNsName = elmMatcher("nsName");
const isNameClass = (
    e: any
): e is XMLElement & { name: "name" | "anyName" | "nsName" } =>
    isName(e) || isAnyName(e) || isNsName(e);
const isFilterable = (
    e: any
): e is XMLElement & { name: "name" | "anyName" | "nsName" | "attribute" } =>
    isAttribute(e) || isNameClass(e);
const isEmptyElement = elmMatcher("empty");

/**
 * Extract all `NGSimpRef` elements and re-simplify the tree. In particular,
 * this removes any `NGSimpAttribute`s that may be in the tree.
 */
export function filterRefs(elm: NGSimpPattern): NGSimpPattern[] {
    switch (elm.name) {
        case "value":
        case "data":
        case "empty":
        case "ref":
        case "text":
            return [elm];
    }

    let filteredChildren = elm.children.filter(
        (e) => !isFilterable(e)
    ) as NGSimpPattern[];
    filteredChildren = filteredChildren.flatMap((e) => filterRefs(e));

    if (filteredChildren.length < elm.children.length) {
        // If one of the children got filtered out, our parent element should
        // be removed.
        return filteredChildren;
    }

    const retElm = { ...elm, children: filteredChildren as any };

    if (
        retElm.name === "group" &&
        isEmptyElement(retElm.children[0]) &&
        isEmptyElement(retElm.children[1])
    ) {
        return [];
    }
    return [retElm];
}
