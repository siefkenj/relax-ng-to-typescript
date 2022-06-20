import { Plugin } from "unified";
import { remove } from "unist-util-remove";
import { Root } from "xast";
import { NG_XML_NODES } from "../types";

/**
 * Simplification steps from https://relaxng.org/spec-20011203.html
 */

/**
 * Filter out all foreign nodes/elements. We don't filter foreign attributes, even though this is part of the spec.
 */
export const rule1: Plugin<void[], Root, Root> = function () {
    function shouldRemove(node: Root["children"][number] | Root): boolean {
        if (node.type === "root") {
            return false;
        }
        if (node.type !== "element" && node.type !== "text") {
            return true;
        }
        if (node.type === "text") {
            return false;
        }
        if (NG_XML_NODES.has(node.name)) {
            return false;
        }
        return true;
    }

    return (tree) => {
        remove(tree, shouldRemove);
    };
};
