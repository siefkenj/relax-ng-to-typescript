import { visitParents } from "unist-util-visit-parents";
import { toString } from "xast-util-to-string";
import { elmMatcher, expected } from "../../xast-utils";
import {
    NGSimpElement,
    NGSimpPattern,
    NGSimpData
    
} from "../simplification/simplified-types";
import { extractName } from "./extract-name";
import { Element as XMLElement, Text as XMLText } from "xast";

function extractData(elm: NGSimpData): string {
    switch (elm.attributes.type) {
        case "anyURI": // https://www.w3.org/TR/xmlschema-2/#anyURI
        case "token": // https://www.w3.org/TR/xmlschema-2/#token
        case "ID": // https://www.w3.org/TR/xmlschema-2/#ID
        case "Name": // https://www.w3.org/TR/xmlschema-2/#Name
        case "NCName": // https://www.w3.org/TR/xmlschema-2/#NCName
        case "string":
        case "language":
            return "string"
        case "time": // https://www.w3.org/TR/xmlschema-2/#time
        case "date": // https://www.w3.org/TR/xmlschema-2/#date
        case "dateTime": // https://www.w3.org/TR/xmlschema-2/#dateTime
        case "gYear": // https://www.w3.org/TR/xmlschema-2/#gYear
        case "gMonth": // https://www.w3.org/TR/xmlschema-2/#gMonth
        case "gDay": // https://www.w3.org/TR/xmlschema-2/#gDay
        case "gYearMonth": // https://www.w3.org/TR/xmlschema-2/#gYearMonth
        case "gMonthDay": // https://www.w3.org/TR/xmlschema-2/#gMonthDay
        case "duration": // https://www.w3.org/TR/xmlschema-2/#duration
            return "string"
        case "double": // https://www.w3.org/TR/xmlschema-2/#double
        case "float": // https://www.w3.org/TR/xmlschema-2/#float
        case "decimal": // https://www.w3.org/TR/xmlschema-2/#decimal
        case "integer": // https://www.w3.org/TR/xmlschema-2/#integer
        case "nonNegativeInteger": // https://www.w3.org/TR/xmlschema-2/#nonNegativeInteger
            return "number"
        case "boolean": // https://www.w3.org/TR/xmlschema-2/#boolean
            return "XMLBoolean"
        default:
            console.log("GOT DATA type: ", elm.attributes.type)
            return "string"
    }
}

/**
 * Extracts a list of attribute types as string that, when printed,
 * are valid typescript types. For example `"string"` will be returned
 * for the `string` type and `"\"foo\""` will be returned (with quotes)
 * for the literal string type `"foo"`.
 */
function extractAttributeType(
    elm: NGSimpPattern,
    accumulatedTypes: string[] = []
): string[] {
    switch (elm.name) {
        // For now, we don't bother with the information `data` provides since, in order to use it,
        // we need a function to coerce it to the correct type.
        case "data":
            return [...accumulatedTypes, "string"/*extractData(elm)*/]; // xast does not support number type in attributes, for now this should be string
        case "text":
            return [...accumulatedTypes, "string"];
        case "choice":
        case "list":
        case "oneOrMore":
        case "group":
            return Array.from(new Set([
                ...accumulatedTypes,
                ...elm.children.flatMap((n) => extractAttributeType(n)),
            ]));
        case "empty":
            return accumulatedTypes;
        case "value":
            return [
                ...accumulatedTypes,
                // String literals should be returned as quoted strings so that they can be directly converted to typescript types
                JSON.stringify(toString(elm)),
            ];
        case "attribute":
        case "ref":
            throw new Error(`Invalid child of attribute: <${elm.name}>`);
    }
    console.warn(
        `Don't know how to extract type information from <${elm.name}> node`
    );
    return accumulatedTypes;
}

/**
 * Extract the attributes of a `<element>` tag.
 */
export function extractAttributes(elm: NGSimpElement) {
    const contents = elm.children[1];
    const attributes: Record<string, { optional: boolean; type: string[] }> =
        {};
    visitParents(contents, elmMatcher("attribute"), (node: XMLElement, parents) => {
        expected(node, "attribute");
        const name = extractName(node as any);
        // If there is a choice in the `parents` that means this attribute is not always present!
        const optional = parents.some((x) => x.name === "choice");
        const type = extractAttributeType((node as any).children[1]);
        attributes[name] = { optional, type };
    });

    return attributes;
}
