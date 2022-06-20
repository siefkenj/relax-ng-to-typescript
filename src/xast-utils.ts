import { Plugin } from "unified";
import { convert } from "unist-util-is";
import { removePosition } from "unist-util-remove-position";
import { Root, Element as XMLElement, Text as XMLText } from "xast";

type Node = Root["children"][number];

/**
 * Filter a list of XML nodes to ensure that only elements and text nodes are in the list.
 */
export function onlyElementsAndText(nodes: Node[]): (XMLElement | XMLText)[] {
    return nodes.filter(
        (node) => node.type === "element" || node.type === "text"
    ) as (XMLElement | XMLText)[];
}

/**
 * Create a matcher that matches elements with tagName = `name`
 */
export function elmMatcher<T extends string>(
    name: T
): (e: any) => e is XMLElement & { name: T } {
    return convert<XMLElement>({ type: "element", name }) as any;
}

/**
 * Returns whether the node is a XAST element
 */
export const isElement = (node: any): node is XMLElement => {
    if (node == null || typeof node !== "object") {
        return false;
    }
    return node.type === "element";
};

/**
 * Recursively remove `prop` from all objects/sub-objects.
 */
export function filterProp<T extends object>(obj: T, prop: string): T {
    const ret = JSON.parse(JSON.stringify(obj));

    function filterPropMut(obj: any) {
        if (obj == null || typeof obj !== "object") {
            return;
        }
        if (Array.isArray(obj)) {
            obj.forEach(filterPropMut);
            return;
        }

        delete obj[prop];
        Object.values(obj).forEach(filterPropMut);
    }

    filterPropMut(ret);

    return ret;
}

/**
 * Throw unless `elm` has the correct tagname
 */
export function expected<T extends string>(
    elm: any,
    expectedTagName?: T | T[]
): asserts elm is XMLElement & { name: typeof expectedTagName } {
    if (!elm) {
        throw new Error(
            `Expected tag name \`${expectedTagName}\` but got \`${elm}\``
        );
    }
    if (!(elm.type === "element")) {
        throw new Error(
            `Expected element type with tag name \`${expectedTagName}\` but got \`${elm}\``
        );
    }
    if (expectedTagName == null) {
        // If no specific tag was given, we dont't check anything else
        return;
    }
    if (
        !(
            elm.name === expectedTagName ||
            (Array.isArray(expectedTagName) &&
                expectedTagName.includes(elm.name))
        )
    ) {
        const { children, ...rest } = elm;
        throw new Error(
            `Expected tag name \`${
                Array.isArray(expectedTagName)
                    ? expectedTagName.join("/")
                    : expectedTagName
            }\` but found element ${JSON.stringify(rest)}`
        );
    }
}

export const removePositionPlugin: Plugin<void[], Root, Root> = function () {
    return (tree) => {
        removePosition(tree, true);
    };
};

export type TypeGuard<T> = (a: any) => a is T