# Senate financial disclosure scraper

The Senate publishes financial disclosure documents ([here](https://efdsearch.senate.gov/search/)) but only as individual reports and not in any sort of machine readable format. This is an attempt to scrape all of the reports and, ultimately, parse them into a machine readable format that can be updated on a schedule.

Many of the documents are submitted electronically and therefore rendered as nice HTML documents, but some are filed on paper and therefore require another process like OCR/human eyes to pry data out of them. This repo contains code for both parts of that workflow

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

1. `$ node step-1-get-report-urls.js`
1. `$ node step-2-download-reports.js`
1. `$ node step-3-parse-html-reports.js`
1. `$ bash step-4-pull-pdf-data.sh`
1. `$ node step-5-combine-to-csv.js`

### Step 1 - Get report URLs

Uses the report search interface to get the URLs for all reports made by current Senators. Generates a JSON file (`data/reports.json`) of each report found in the tool.

### Step 2 - Download reports

Uses the `data/reports.json` file generated in step 1 to download a copy of all of the reports. Some reports are HTML files and some are scanned PDFs. We download a copy so that we don't have to repeatedly hit the Senate's servers.

### Step 3 - Parse HTML reports

Extract data from all `.html` files and create a `.json` file for each.

Both steps 3 and 4 rely on an [internal, intermediary JSON data model](#json-data-model), which contain the structured data from the financial disclosure reports.

### Step 4 - Pull down data from manually reviewed PDFs

Lots of the reports are structure HTML, which is great because we can parse those and extract data. In fact, we just did that in step 3.

A number of the reports are still filed on paper and are therefore pages of scanned PDFs. These things come in all sorts of shapes and sizes and for now I just use another tool to annotate them with humans. That tool is in this repository and you can run it with `npm run pdf-review`. It reads and writes data to [another repo](https://github.com/jeremiak/us-senate-financial-disclosure-data/), so when we are running a build process to get the most recent data, we need to pull down the JSON files that represent each PDF report.

### Step 5 - Create CSVs

* `transactions.csv` - Transactions from parts 4a and 4b of annual reports and from periodic transaction reports

_To do_:

I think the best thing would be to make a CSV per major section in each annual report (it seems like beyond amendments the only thing that's reported regularly is new transactions). I imagine that the CSVs might be named something like:

* `honoraria.csv`
* `earned.csv`
* `assets.csv`
* `gifts.csv`
* `travel.csv`
* `liabilities.csv`
* `positions.csv`

### PDF Review

You can interact with this tool without pulling down the repo. I have a small Heroku instance running at [https://senate-financial-disclosures.herokuapp.com](https://senate-financial-disclosures.herokuapp.com/). It has write access so if you feel like extracting some data out of PDFs and into structured JSON, please feel free to use it to your hearts content!

This tool pulls up all of the PDF files and allows us to read them and build up the data in JSON. It reads and writes to [another Github repository](https://github.com/jeremiak/us-senate-financial-disclosure-data/) and therefore might be a little bit slow.

If you want to run it locally, you can do:

1. `cd pdf-review`
1. `cp .env.example .env` # and add a Github token
1. `node index.js`
1. Application runs at [http://localhost:3000](http://localhost:3000)

<hr />

## JSON data model

This is not the structure of the generated CSV files, but instead if the structure of the JSON files that are the intermediary stage between scraping and the published CSVs.

At the top level, each report's JSON file looks like:
- `type` - [Annual, annual amendment, periodic transaction]
- `title` - Report title
- `filer` - Senator's name (should be from drop down so standardized)
- `filed-date` - Date received by the clerk
- `filed-time` - Time received by the clerk
- `calendar-year` [if annual report]
- `data` - An array of objects, represents the data from the report

Each object within `data` will have the following structure:
- `label` - A string, represents the sections of an annual report. In the case of a periodic transaction report, it will be "Transactions"
- `amended` - A boolean, if the section of the report represents an amendment
- `rows` - An array of objects that represent the data from each section or report

There are many different possible values for `label`, and the structure of each object in `rows` depends on the label. Generally speaking, each refers to a section of a report, and therefore they vary by report type.

### Annual report possible `label` values

**Part 1. Honoraria Payments or Payments to Charity in Lieu of Honoraria**
- `date`
- `activity`
- `amount`
- `who-paid`
- `who-received-payment`


**Part 2. Earned and Non-Investment Income**
- `who-was-paid`
- `type`
- `who-paid`
- `amount-paid`


**Part 3. Assets**
- `asset`
- `asset-type`
- `owner`
- `value` - Range
- `income-type`
- `income`

**Part 4a. Periodic Transaction Report Summary** / 
**Part 4b. Transactions**
- `owner`
- `ticker`
- `asset-name`
- `transaction-type`
- `transaction-date`
- `amount`
- `comment`

**Part 5. Gifts**

**Part 6. Travel**
- `date(s)`
- `traveler(s)`
- `travel-type`
- `itinerary`
- `reimbursed-for`
- `who-paid`
- `comment`

**Part 7. Liabilities**
- `incurred`
- `debtor`
- `type`
- `points`
- `rate(term)`
- `amount`
- `creditor`
- `comments`

**Part 8. Position**
- `position-dates`
- `position-held`
- `entity`
- `entity-type`
- `comments`

**Part 9. Agreement**
- `date`
- `parties-involved`
- `type`
- `status-and-terms`

**Part 10. Compensation**


**Attachments & Comment**
- `document-title`
- `document-url`
- `date-time-added`

### Periodic transaction report possible `label` values

There is only one possible value in the case of a PTR.

**Transaction**
- `transaction-date`
- `owner`
- `ticker`
- `asset-name`
- `transaction-type`
- `amount`
- `comment`
