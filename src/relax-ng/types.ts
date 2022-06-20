/**
 * RELAX-NG types. Ported from https://relaxng.org/spec-20011203.html#element-pattern
 */

// Utility types to create element nodes with specific children
export type _RecordOf<Attrs extends string[]> = {
    [Key in Attrs[number]]: string;
};
export type RecordOf<Attrs = void[]> = Attrs extends string[]
    ? _RecordOf<Attrs>
    : _RecordOf<[]>;

// XML Types
export type QName = string;
export type NCName = string;

// RELAX-NG Types
/**
 * A XML element with tag-name `Name` and restricted children/attributes. Attrs are
 * provided as a list of strings and they are all mandatory with values of export type `string`.
 */
export type NGElement<Name, Children = void, Attrs = void[]> = {
    type: "element";
    name: Name;
    children: Children[];
} & RecordOf<Attrs>;

export interface NGElementNoAttrs<Name, Children = void, Value = void> {
    type: "element";
    name: Name;
    children: Children[];
    value?: Value;
}
export interface NGElementAttrName<Name, Children = void, Value = void>
    extends NGElementNoAttrs<Name, Children, Value> {
    attributes: { name: string };
}
export interface NGElementAttrHref<Name, Children = void, Value = void>
    extends NGElementNoAttrs<Name, Children, Value> {
    attributes: { href: string };
}

export interface NGElementAttrType<Name, Children = void, Value = void>
    extends NGElementNoAttrs<Name, Children, Value> {
    attributes: { type: string };
}

export type NGStart = {
    type: "start";
    combine?: NGMethod;
    children: NGPattern;
};

export type NGGrammar = {
    type: "grammar";
    start: NGStart;
    definitions: NGDefine[];
};

export interface NGValue extends NGElementNoAttrs<"value", void, string> {
    attributes: { type?: NCName };
}

export type NGRef = NGElementAttrName<"ref">

export type NGPattern =
    | NGElementAttrName<"element", NGPattern>
    | NGElementNoAttrs<"element", NGNameClass | NGPattern>
    | NGElementAttrName<"attribute", NGPattern>
    | NGElementNoAttrs<"attribute", NGNameClass | NGPattern>
    | NGElementNoAttrs<"group", NGPattern>
    | NGElementNoAttrs<"interleave", NGPattern>
    | NGElementNoAttrs<"optional", NGPattern>
    | NGElementNoAttrs<"zeroOrMore", NGPattern>
    | NGElementNoAttrs<"oneOrMore", NGPattern>
    | NGElementNoAttrs<"list", NGPattern>
    | NGElementNoAttrs<"mixed", NGPattern>
    | NGRef
    | NGElementAttrName<"parentRef">
    | NGElementNoAttrs<"empty">
    | NGElementNoAttrs<"text">
    | NGValue
    | NGElementAttrType<"data", NGParam | NGExceptPattern>
    | NGElementNoAttrs<"notAllowed">
    | NGElementAttrHref<"externalRef">
    | NGElementNoAttrs<"grammar", NGGrammarContext>;

export type NGParam = NGElementAttrName<"param", void, string>;

export type NGExceptPattern = NGElementNoAttrs<"except", NGPattern>;

export type NGGrammarContext = NGStart | NGDefine;
//   | NGElementNoAttrs<"div", NGGrammarContext>
//   | NGElementAttrHref<"include", NGIncludeContent>;

export type NGIncludeContent =
    | NGStart
    | NGDefine
    | NGElementNoAttrs<"div", NGIncludeContent>;

export type NGDefine = {
    type: "define";
    name: NCName;
    combine?: NGMethod;
    children: NGPattern[];
};

export type NGMethod = "choice" | "interleave";

export type NGNameClass =
    | NGElementNoAttrs<"name", void, string>
    | NGElementNoAttrs<"anyName", NGExceptNameClass>
    | NGElementNoAttrs<"nsName", NGExceptNameClass>
    | NGElementNoAttrs<"choice", NGNameClass>;
export interface NGExceptNameClass extends NGElement<"except", NGNameClass> {}

export const NG_XML_NODES = new Set([
    "element",
    "attribute",
    "group",
    "interleave",
    "choice",
    "optional",
    "zeroOrMore",
    "oneOrMore",
    "list",
    "mixed",
    "ref",
    "parentRef",
    "empty",
    "text",
    "value",
    "data",
    "param",
    "except",
    "notAllowed",
    "externalRef",
    "grammar",
    "div",
    "include",
    "start",
    "define",
    "name",
    "anyName",
    "nsName",
]);
