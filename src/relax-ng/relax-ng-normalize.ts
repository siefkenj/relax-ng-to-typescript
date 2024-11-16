import { Plugin, Transformer } from "unified";
import { EXIT, visit } from "unist-util-visit";
import { Root } from "xast";
import { elmMatcher, expected } from "../xast-utils";
import { NGDefine, NGElementAttrName, NGGrammar, NGPattern } from "./types";
import { toString } from "xast-util-to-string";
import {
    NGSimpDefine,
    NGSimpElement,
    NGSimpGrammar,
    NGSimpPattern,
} from "./simplification/simplified-types";

type XastChild = Root["children"][number];

function parsePattern(elm: NGSimpPattern): NGPattern {
    expected(elm, [
        "empty",
        "text",
        "data",
        "value",
        "list",
        "attribute",
        "ref",
        "oneOrMore",
        "choice",
        "group",
        "interleave",
    ]);

    switch (elm.name) {
        case "empty":
            return { type: "element", name: "empty", children: [] };
        case "text":
            return { type: "element", name: "text", children: [] };
        case "data":
        case "value":
        case "list":
        case "attribute":
        case "ref":
        case "oneOrMore":
        case "choice":
        case "group":
        //  return {
        //      type: "element",
        //      name: "group",
        //      children: elm.children.map(e => parsePattern(e)),
        //  };
        case "interleave":
    }
    console.warn(`Failed to process element <${elm.name}>`);
    return { type: "element", name: "empty", children: [] };
}

function parseElement(elm: NGSimpElement): NGElementAttrName<"element", any> {
    expected(elm, "element");
    const nameNode = elm.children[0];
    expected(nameNode, "name");
    const name = toString(nameNode);
    const contentsNode = elm.children[1];
    expected(contentsNode);
    if (contentsNode.name === "notAllowed") {
        throw new Error(
            `Elements are not allowed to have <notAllowed> as children`
        );
    }
    if (contentsNode.name === "empty") {
        return {
            type: "element",
            name: "element",
            attributes: { name },
            children: [],
        };
    }

    return {
        type: "element",
        name: "element",
        attributes: { name },
        children: [parsePattern(contentsNode)],
    };
}

function parseDefine(elm: NGSimpDefine): NGDefine {
    expected(elm, "define");
    const ret: NGDefine = {
        type: "define",
        name: elm.attributes.name,
        children: [parseElement(elm.children[0])],
    };
    return ret;
}

/**
 * Turn a REACT-NG grammar that already has the `simplification` steps run
 * into an `NGGrammar`
 */
export const simplifiedGrammarToJson: Plugin<void[], Root, NGGrammar> =
    function (): Transformer<Root, NGGrammar> {
        return (tree) => {
            let grammar: NGSimpGrammar | null = null as NGSimpGrammar | null;
            visit(tree, elmMatcher("grammar"), (node) => {
                grammar = node as any as NGSimpGrammar;
                return EXIT;
            });
            if (!grammar) {
                throw new Error(`Could not find <grammar> element`);
            }

            const start = grammar.children[0];
            expected(start, "start");
            const startRef = start.children[0];
            expected(startRef, "ref");
            const definitions = grammar.children.slice(1) as NGSimpDefine[];

            const ret: NGGrammar = {
                type: "grammar",
                start: { type: "start", children: startRef },
                definitions: [],
            };
            //console.log(ret);
            //console.log(definitions.slice(0, 2));
            //console.log(definitions.slice(1, 2).map(parseDefine));
            return tree as unknown as NGGrammar;
        };
    };
