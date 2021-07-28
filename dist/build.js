"use strict";
const fs = require("fs");
const path = require("path");
try {
    const file_list = JSON.parse(fs.readFileSync("./src/filter/filter_list.json"));
    file_list.filter.forEach((filter) => {
        const json_file_list = fs.readdirSync(path.join("./src/filter", filter.dir));
        let filter_content = [];
        json_file_list.forEach((file_name) => {
            try {
                const content = fs.readFileSync(path.join("./src/filter/", filter.dir, file_name), "utf8");
                const content_json = JSON.parse(content);
                filter_content.push(content_json);
            }
            catch (e) {
                console.log(e);
            }
        });
        let joined_filter;
        const query_list = [];
        filter_content.forEach((content) => query_list.push(content.rule));
        joined_filter = {
            rule: ["or", [...query_list]]
        };
        try {
            fs.writeFileSync(path.join("./dist/filter", `${filter.dir}.json`), JSON.stringify(joined_filter, null, 4), "utf8");
        }
        catch (e) {
            console.log(e);
        }
    });
}
catch (e) {
    console.log(e);
}
