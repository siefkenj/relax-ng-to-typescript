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
 * Simplification steps from https://relaxng.org/spec-20011203.html
 */

/**
  The name attribute on an element or attribute element is transformed into a name child element.
 */
export const rule8: Plugin<void[], Root, Root> = function () {
    return (tree) => {
        tree.children = tree.children.filter(isNotWhitespace);
        visit(tree, isElement, (node) => {
            if (node.name !== "element" && node.name !== "attribute") {
                return;
            }
            if (node.attributes?.name) {
                const name = node.attributes.name;
                delete node.attributes.name;
                node.children.unshift({
                    type: "element",
                    name: "name",
                    children: [{ type: "text", value: name }],
                });
            }
        });
    };
};
