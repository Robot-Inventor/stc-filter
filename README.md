# STC Filter

[日本語](README_ja.md)

This is the filter data for Advanced Spam Detection in [Robot-Inventor/spam-tweets-compressor](https://github.com/Robot-Inventor/spam-tweets-compressor).

The Spam Tweets Compressor will retrieve the necessary data in this repository via CDN.

## About Filters

For an overview of filters and a description of each filter, see [Filter Description](docs/filter_description.md).

## Filter Format

The filter data is in JSON format. For more information on the format, please refer to the [About Advanced Spam Detection](https://github.com/Robot-Inventor/spam-tweets-compressor/blob/main/docs/en/advanced_spam_detection.md) in the Spam Tweets Compressor repository.

## How to Create Or Edit Filters

### 1. Add A Directory

To create a new filter, create a new directory at [src/filter/](https://github.com/Robot-Inventor/stc-filter/tree/main/src/filter).

If you want to edit an existing filter, skip to Step 3.

### 2. Edit filter_list.json

Add the directory name and filter name to [src/filter/filter_list.json](https://github.com/Robot-Inventor/stc-filter/blob/main/src/filter/filter_list.json). The format of filter_list.json is as follows.

```json
{
    "filter": [
        {
            "dir": "directory name",
            "name": "filter name",
            "id": "ID that is set once and never changed"
        }
    ]
}
```

### 3. Create JSON Files

In the directory of the filter you want to create or edit, create a JSON file or JSONC file with any file name or edit an existing JSON file with reference to [About Advanced Spam Detection](https://github.com/Robot-Inventor/spam-tweets-compressor/blob/main/docs/en/advanced_spam_detection.md).

From the perspective of maintenance management, we recommend splitting the JSON file by content. There is no specification for the number of JSON files to be created or their file names.

Also, you can use the following information from [About Advanced Spam Detection](https://github.com/Robot-Inventor/spam-tweets-compressor/blob/main/docs/en/advanced_spam_detection.md) Although it is not listed in the format, you can optionally provide a description of each JSON file in the ``description`` property.

### 4. Build

The following command will create a new JSON file in [dist/filter/](https://github.com/Robot-Inventor/stc-filter/tree/main/dist/filter) by merging JSON files in each directory of [src/filter/](https://github.com/Robot-Inventor/stc-filter/tree/main/src/filter), a new single JSON file will be created by merging the JSON files in each directory.

```powershell
npm run build
```

Also, when you run the above command, [dist/advanced_filter.json](https://github.com/Robot-Inventor/stc-filter/blob/main/dist/advanced_filter.json) where the information of the filter name and CDN URL is stored will be automatically updated.

## Delivery Of Filter Updates

Filter data is automatically delivered via CDN. There are no special steps required to deliver filter updates; the CDN cache is updated every 24 hours, so it can take up to 24 hours after a filter update is merged for the updated filter to be delivered.
