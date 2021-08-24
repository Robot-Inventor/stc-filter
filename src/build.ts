const fs = require("fs");
const path = require("path");
const { parse } = require("jsonc-parser");

interface filter_list_type {
    filter: Array<{
        dir: string,
        name: string,
        id: string;
    }>
}

interface query_element {
    mode: "include" | "exclude",
    type: "text" | "hashtag" | "name" | "id" | "link",
    string: string
}

type query_type = ["and" | "or", Array<query_element | query_type>];

interface query_object {
    rule: query_type
}
interface maybe_query_object extends query_object {
    length?: number;
}


function lint_query_object(input: maybe_query_object): [true] | [false, string] {
    const is_object = typeof input === "object" && input.length === undefined;
    if (!is_object) return [false, "Input must be an object."];

    const has_rule = "rule" in input;
    if (!has_rule) return [false, "Input object must have rule property."];

    const is_type_of_rule_right = lint_query_type(input.rule);
    if (!is_type_of_rule_right[0]) return is_type_of_rule_right;

    return [true];
}

function lint_query_type(input: query_type): [true] | [false, string] {
    const is_array = typeof input === "object" && input.length !== undefined;
    if (!is_array) return [false, "query_type must be an array."];

    const is_and_or = ["and", "or"].includes(input[0]);
    if (!is_and_or) return [false, "The first content of query_type must be \"and\" or \"or\"."];

    const is_length_2 = input.length === 2;
    if (!is_length_2) return [false, "Length of query_type must be 2."];

    const is_second_value_array = typeof input[1] === "object" && input[1].length !== undefined;
    if (!is_second_value_array) return [false, "The second content of query_type must be an array."];

    const is_type_of_second_value_right = ((): [true] | [false, string] => {
        let result: [true] | [false, string] = [true];
        input[1].forEach((e: any) => {
            const is_array = typeof e === "object" && e.length !== undefined;
            const is_object = typeof e === "object" && e.length === undefined;

            if (is_array) {
                const lint_result = lint_query_type(e);
                if (!lint_result[0]) result = lint_result;
            } else if (is_object) {
                const lint_result = lint_query_element(e);
                if (!lint_result[0]) result = lint_result;
            } else {
                result = [false, "The type of the second content of query_type must be query_type or query_object"];
            }
        });
        return result;
    })();
    if (!is_type_of_second_value_right[0]) return is_type_of_second_value_right;

    return [true];
}

function lint_query_element(input: query_element): [true] | [false, string] {
    const has_mode = "mode" in input;
    if (!has_mode) return [false, "query_element must have mode property"];

    const is_mode_right = ["include", "exclude"].includes(input.mode);
    if (!is_mode_right) return [false, "The value of mode property of query_element must be \"include\" or \"exclude\"."];

    const has_type = "type" in input;
    if (!has_type) return [false, "query_element must have type property"];

    const is_type_right = ["text", "hashtag", "name", "id", "link"].includes(input.type);
    if (!is_type_right) return [false, "The value of type property of query_element must be \"text\", \"hashtag\", \"name\", \"id\" or \"link\"."];

    const has_string = "string" in input;
    if (!has_string) return [false, "query_element must have string property."];

    const is_type_of_string_right = typeof input.string === "string";
    if (!is_type_of_string_right) return [false, "The type of string property of query_element must be string."];

    return [true];
}

function lint(input: query_object): [true] | [false, string] {
    return lint_query_object(input);
}

try {
    const file_list: filter_list_type = parse(fs.readFileSync("./src/filter/filter_list.json").toString());
    const advanced_filter: { [key: string]: { url: string, id: string } } = {};
    file_list.filter.forEach((filter) => {
        const json_file_list: Array<string> = fs.readdirSync(path.join("./src/filter", filter.dir));
        let filter_content: Array<query_object> = [];

        json_file_list.forEach((file_name) => {
            try {
                const file_path = path.join("./src/filter/", filter.dir, file_name)
                const content = fs.readFileSync(file_path, "utf8");
                const content_json: query_object = parse(content.toString());
                const lint_result = lint(content_json);
                if (lint_result[0]) filter_content.push(content_json);
                else {
                    throw `The file ${file_path} is in the wrong format.\nreason:\n${lint_result[1]}\n\n`;
                }
            } catch (e) {
                console.log(e);
            }
        });

        let joined_filter: query_object;
        const query_list: Array<query_type> = [];
        filter_content.forEach((content) => query_list.push(content.rule));
        joined_filter = {
            rule: ["or", [...query_list]]
        };

        try {
            fs.writeFileSync(path.join("./dist/filter", `${filter.dir}.json`), JSON.stringify(joined_filter, null, 4), "utf8");
            advanced_filter[filter.name] = {
                url: `https://cdn.statically.io/gh/Robot-Inventor/stc-filter/main/dist/filter/${filter.dir}.json`,
                id: filter.id
            };
        } catch (e) {
            console.log(e);
        }
    });
    try {
        fs.writeFileSync("./dist/advanced_filter.json", JSON.stringify(advanced_filter, null, 4), "utf8");
    } catch (e) {
        console.log(e);
    }
} catch (e) {
    console.log(e);
}
