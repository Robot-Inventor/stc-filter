import fs from "fs";
import { parse } from "jsonc-parser";
import path from "path";

interface filter_list_type {
    filter: Array<{
        dir: string;
        name: string;
        id: string;
    }>;
}

interface query_element {
    mode: "include" | "exclude";
    type: "text" | "hashtag" | "name" | "id" | "link";
    string: string;
}

type query_type = ["and" | "or", Array<query_element | query_type>];

interface query_object {
    rule: query_type;
}
interface maybe_query_object extends query_object {
    length?: number;
}

const judge_plain_object = (input: unknown) =>
    typeof input === "object" && input !== null && input.constructor === Object;

class Lint {
    static run(input: query_object): [true] | [false, string] {
        return Lint.query_object(input);
    }

    static query_object(input: maybe_query_object): [true] | [false, string] {
        if (!judge_plain_object(input)) return [false, "Input must be an object."];

        const has_rule = "rule" in input;
        if (!has_rule) return [false, "Input object must have rule property."];

        const is_type_of_rule_right = Lint.query_type(input.rule);
        if (!is_type_of_rule_right[0]) return is_type_of_rule_right;

        return [true];
    }

    static query_type(input: Array<unknown>): [true] | [false, string] {
        if (!Array.isArray(input)) return [false, "query_type must be an array."];

        // eslint-disable-next-line no-magic-numbers
        const is_length_2 = input.length === 2;
        if (!is_length_2) return [false, "Length of query_type must be 2."];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const is_and_or = ["and", "or"].includes(input[0]);
        if (!is_and_or) return [false, 'The first content of query_type must be "and" or "or".'];

        const is_second_value_array = Array.isArray(input[1]);
        if (!is_second_value_array) return [false, "The second content of query_type must be an array."];

        const is_type_of_second_value_right = ((): [true] | [false, string] => {
            let result: [true] | [false, string] = [true];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            input[1].forEach((elm: any) => {
                const is_array = Array.isArray(elm);
                const is_object = judge_plain_object(elm);

                if (is_array) {
                    const lint_result = Lint.query_type(elm);
                    if (!lint_result[0]) result = lint_result;
                } else if (is_object) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    const lint_result = Lint.query_element(elm);
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

    static query_element(input: query_element): [true] | [false, string] {
        const has_mode = "mode" in input;
        if (!has_mode) return [false, "query_element must have mode property"];

        const is_mode_right = ["include", "exclude"].includes(input.mode);
        if (!is_mode_right)
            return [false, 'The value of mode property of query_element must be "include" or "exclude".'];

        const has_type = "type" in input;
        if (!has_type) return [false, "query_element must have type property"];

        const is_type_right = ["text", "hashtag", "name", "id", "link"].includes(input.type);
        if (!is_type_right)
            return [
                false,
                'The value of type property of query_element must be "text", "hashtag", "name", "id" or "link".'
            ];

        const has_string = "string" in input;
        if (!has_string) return [false, "query_element must have string property."];

        const is_type_of_string_right = typeof input.string === "string";
        if (!is_type_of_string_right) return [false, "The type of string property of query_element must be string."];

        return [true];
    }
}

const generate_cdn_url = (relative_path: string) =>
    `https://cdn.statically.io/gh/Robot-Inventor/stc-filter/main/${relative_path}?dev=1`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const is_filter_list = (arg: any): arg is filter_list_type => {
    try {
        const is_object = judge_plain_object(arg);
        const has_filter = "filter" in arg;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const is_filter_array = Array.isArray(arg.filter);

        const filter_element = (() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            for (const element of arg.filter) {
                const is_element_object = judge_plain_object(element);
                const has_right_property = "dir" in element && "name" in element && "id" in element;
                const property_type =
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    typeof element.dir === "string" &&
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    typeof element.name === "string" &&
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    typeof element.id === "string";

                if (!(is_element_object && has_right_property && property_type)) return false;
            }

            return true;
        })();

        return is_object && has_filter && is_filter_array && filter_element;
    } catch {
        return false;
    }
};

const get_filter_list = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = parse(fs.readFileSync("./src/filter/filter_list.json").toString());
    if (is_filter_list(result)) return result;
    else throw new TypeError("The format of filter list is not correct.");
};

try {
    const filter_list = get_filter_list();
    const advanced_filter: { [key: string]: { url: string; id: string } } = {};

    for (const filter of filter_list.filter) {
        const json_file_list: Array<string> = fs.readdirSync(path.join("./src/filter", filter.dir));
        const filter_content: Array<query_object> = [];

        json_file_list.forEach((file_name) => {
            if (!/\.jsonc?$/u.test(file_name)) return;

            try {
                const file_path = path.join("./src/filter/", filter.dir, file_name);

                const content = fs.readFileSync(file_path, "utf8");
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const content_json = parse(content.toString());

                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const lint_result = Lint.run(content_json);

                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                if (lint_result[0]) filter_content.push(content_json);
                else {
                    throw new SyntaxError(
                        `The file ${file_path} is in the wrong format.\nreason:\n${lint_result[1]}\n\n`
                    );
                }
            } catch (err) {
                console.error(err);
            }
        });

        const query_list: Array<query_type> = [];

        filter_content.forEach((content) => query_list.push(content.rule));
        const joined_filter = {
            rule: ["or", [...query_list]]
        };

        try {
            fs.writeFileSync(
                path.join("./dist/filter", `${filter.dir}.json`),
                JSON.stringify(joined_filter, null, 4),
                "utf8"
            );
            advanced_filter[filter.name] = {
                id: filter.id,
                url: generate_cdn_url(`dist/filter/${filter.dir}.json`)
            };
        } catch (err) {
            console.error(err);
        }
    }

    try {
        fs.writeFileSync("./dist/advanced_filter.json", JSON.stringify(advanced_filter, null, 4), "utf8");
    } catch (err) {
        console.error(err);
    }
} catch (err) {
    console.error(err);
}
