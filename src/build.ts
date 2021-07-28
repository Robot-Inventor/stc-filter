const fs = require("fs");
const path = require("path");

interface filter_list_type {
    filter: Array<{
        dir: string,
        name: string
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

try {
    const file_list: filter_list_type = JSON.parse(fs.readFileSync("./src/filter/filter_list.json"));
    file_list.filter.forEach((filter) => {
        const json_file_list: Array<string> = fs.readdirSync(path.join("./src/filter", filter.dir));
        let filter_content: Array<query_object> = [];

        json_file_list.forEach((file_name) => {
            try {
                const content = fs.readFileSync(path.join("./src/filter/", filter.dir, file_name), "utf8");
                const content_json: query_object = JSON.parse(content);
                filter_content.push(content_json);
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
            fs.writeFileSync(path.join("./dist/filter", `${filter.dir}.json`), JSON.stringify(joined_filter), "utf8");
        } catch (e) {
            console.log(e);
        }
    });
} catch (e) {
    console.log(e);
}
