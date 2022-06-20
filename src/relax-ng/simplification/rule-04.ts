import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { Root, Element } from "xast";
import { elmMatcher, TypeGuard } from "../../xast-utils";

function isNotWhitespace(c: Root["children"][number]): boolean {
    if (c.type === "text" && c.value.trim() === "") {
        return false;
    }
    return true;
}

/**
 * For any value element that does not have a type attribute, a type attribute
 * is added with value token and the value of the datatypeLibrary attribute is changed to the empty string.
 */
export const rule4: Plugin<void[], Root, Root> = function () {
    return (tree) => {
        tree.children = tree.children.filter(isNotWhitespace);
        const c = tree.children[0];
        visit(tree, elmMatcher("value") as TypeGuard<Element>, (node) => {
            if (!node.attributes?.type) {
                node.attributes = node.attributes || {};
                node.attributes.type = "token";
            }
            if (node.attributes?.datatypeLibrary) {
                node.attributes.datatypeLibrary = "";
            }
        });
    };
};
