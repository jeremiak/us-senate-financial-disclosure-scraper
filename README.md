# Senate financial disclosure scraper

The Senate publishes financial disclosure documents ([here](https://efdsearch.senate.gov/search/)) but only as individual reports and not in any sort of machine readable format. This is an attempt to scrape all of the reports and, ultimately, parse them into a machine readable format that can be updated on a schedule.

Many of the documents are submitted electronically and therefore rendered as nice HTML documents, but some are filed on paper and therefore require another process like OCR/human eyes to pry data out of them.

## Workflow

The workflow is broken out into steps that are dependent on previous steps but can be run independently. This helps breaks the entire process down into chunks so its easier to restart if something gets corrupted or goes wrong.

You'll need to have `imagemagick` installed, otherwise everything is a node dependency.

Assuming you've run the following:

```
$ brew install imagemagick # on mac
$ nvm use
$ npm install
```

Then you can run each step of the workflow as a Node script:

`$ node step-1-get-report-urls.js`

`$ node step-2-download-reports.js`

### Step 1 - Get report URLs

Uses the report search interface to get the URLs for all reports made by current Senators. Generates a JSON file (`data/reports.json`) of each report found in the tool.

### Step 2 - Download reports

Uses the `data/reports.json` file generated in step 1 to download a copy of all of the reports. Some reports are HTML files and some are scanned PDFs. We download a copy so that we don't have to repeatedly hit the Senate's servers.

### Step 3 - Parse HTML reports

Extract data from all `.html` files and create a `.json` file.

### Step 4 - PDFs

_Still to implement._
