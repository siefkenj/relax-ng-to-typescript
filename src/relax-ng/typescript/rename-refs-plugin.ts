import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { isElement } from "../../xast-utils";
import { NGSimpRoot } from "../simplification/simplified-types";
import { normalizeTypeName } from "./normalize-type-name";
import { Root, Element as XMLElement, Text as XMLText } from "xast";

/**
 * UnifiedJs plugin that renames all references to make sure they start with the word `Element`
 * and that they are valid TypeScript type names.
 */
export const renameRefsPlugin: Plugin<never[], NGSimpRoot, NGSimpRoot> =
    function () {
        return (tree) => {
            // Compute what all the existing ref names are and what they should be renamed to
            const refNames: Record<string, string> = {};
            visit(tree, isElement, (node: XMLElement) => {
                if (!(node.name === "define")) {
                    return;
                }
                refNames[node.attributes.name!] = node.attributes.name!;
            });
            // We iterate over keys instead of doing a `for in` loop because we mutate
            // `refNames` in the loop.
            for (const name of Object.keys(refNames)) {
                if (!name.startsWith("Element")) {
                    let newName = normalizeTypeName(name, "Element");
                    if (refNames[newName]) {
                        // We need to search for an unused name
                        let i = 2;
                        while (refNames[`${newName}${i}`] && i < 1000) {
                            i++;
                        }
                        if (i === 1000) {
                            console.warn(
                                `Tried to make a unique version of the name "${newName}" but failed after ${i} attempts`
                            );
                        }
                        newName = `${newName}${i}`;
                    }
                    refNames[name] = newName;
                    refNames[newName] = newName;
                }
            }

            // First thing to do is to rename all refs as their Typescript type names.
            const usedNames: Set<string> = new Set();
            visit(tree, isElement, (node: XMLElement) => {
                if (node.name === "ref") {
                    if (refNames[node.attributes.name!]) {
                        node.attributes.name = refNames[node.attributes.name!];
                    } else {
                        const newName = normalizeTypeName(
                            node.attributes.name!,
                            "Element"
                        );
                        console.warn(
                            `Found <ref name="${node.attributes.name}" /> reference, but did not find a corresponding <define>; renaming to "${newName}"`
                        );
                        node.attributes.name = newName;
                    }
                }
                if (node.name === "define") {
                    node.attributes.name = refNames[node.attributes.name!];
                }
            });
            return tree;
        };
    };
