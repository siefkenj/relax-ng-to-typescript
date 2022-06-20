import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { Root } from "xast";
import { isElement } from "../../xast-utils";

function isNotWhitespace(c: Root["children"][number]): boolean {
    if (c.type === "text" && c.value.trim() === "") {
        return false;
    }
    return true;
}

/**
 * For each element other than value and param, each child that is a string containing only whitespace characters is removed.
 *
 * Leading and trailing whitespace characters are removed from the value of each name,
 * type and combine attribute and from the content of each name element.
 */
export const rule2: Plugin<void[], Root, Root> =
    function () {
        return (tree) => {
            tree.children = tree.children.filter(isNotWhitespace);
            visit(tree, isElement, (node) => {
                if (node.name !== "value" && node.name !== "param") {
                    // Filter out all text nodes consisting of only whitespace
                    node.children = node.children.filter(isNotWhitespace);
                }
                if (node.name === "name") {
                    if (node.children.length > 1) {
                        console.warn(
                            "Expected exactly one child of a <name> element, found",
                            node.children.length
                        );
                    } else {
                        const child = node.children[0];
                        if (child && child.type === "text") {
                            child.value = child.value.trim();
                        }
                    }
                }
                if (node.attributes?.name) {
                    node.attributes.name = node.attributes.name.trim();
                }
                if (node.attributes?.type) {
                    node.attributes.type = node.attributes.type.trim();
                }
                if (node.attributes?.combine) {
                    node.attributes.combine = node.attributes.combine.trim();
                }
            });
        };
    };
