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

1. `$ node step-1-get-report-urls.js`
1. `$ node step-2-download-reports.js`
1. `$ node step-3-parse-html-reports.js`
1. `$ node step-4-pdfs.js` - This does nothing really, still have to figure this part out
1. `$ node step-5-combine-to-csv.js`


### Step 1 - Get report URLs

Uses the report search interface to get the URLs for all reports made by current Senators. Generates a JSON file (`data/reports.json`) of each report found in the tool.

### Step 2 - Download reports

Uses the `data/reports.json` file generated in step 1 to download a copy of all of the reports. Some reports are HTML files and some are scanned PDFs. We download a copy so that we don't have to repeatedly hit the Senate's servers.

### Step 3 - Parse HTML reports

Extract data from all `.html` files and create a `.json` file for each.

### Step 4 - Manually review PDFs

_Still to implement. Some sort of system that allows for a human to easily read a PDF and manually extract the structured data out of it._

This tool pulls up all of the PDF files and allows us to read them and build up the data in JSON. This is a pretty manual process and is based on the current contents of the file system.

If you have some PDFs that you need to annotate with a JSON file, do the following:

1. `cd step-4-pdf-review`
1. `node index.js`
1. Application runs at [http://localhost:3000](http://localhost:3000)

When you're done, make sure to remember to `cd ..` since you're not in the project root.

### Step 5 - Create CSVs

* `transactions.csv` - all of the transactions from the filings

_To do_:

I think the best thing would be to make a CSV per major section in each annual report (it seems like beyond amendments the only thing that's reported regularly is new transactions). I imagine that the CSVs might be named something like:

* `honoraria.csv`
* `earned.csv`
* `assets.csv`
* `gifts.csv`
* `travel.csv`
* `liabilities.csv`
* `positions.csv`


## Data model

1. `type` - [Annual, annual amendment, periodic transaction]
1. `title` - Report title
1. `filer` - Senator's name (should be from drop down so standardized)
1. `filed-date` - Date received by the clerk
1. `filed-time` - Time receieved by the clerk
1. `calendar-year` [if annual report]
1. `dataEntryComplete` - Supplied by the report digitizer, if they are done with the document
1. `data` - most of the data from the report

data is an array of objects
- `label`
- `amended` - boolean
- `rows`

`label`:
- Part 1. Honoraria Payments or Payments to Charity in Lieu of Honoraria
`rows`:
-- `date`
-- `activity`
-- `amount`
-- `who-paid`
-- `who-received-payment`

- Part 2. Earned and Non-Investment Income 
`rows`:
-- `who-was-paid`
-- `type`
-- `who-paid`
-- `amount-paid`


- Part 3. Assets 
`rows`:
-- `asset`
-- `asset-type`
-- `owner`
-- `value` - Range
-- `income-type`
-- `income`

- Part 4a. Periodic Transaction Report Summary
- Part 4b. Transactions 
`rows`:
-- `owner`
-- `ticker`
-- `asset-name`
-- `transaction-type`
-- `transaction-date`
-- `amount`
-- `comment`

- Part 5. Gifts

- Part 6. Travel
`rows`:
-- `date(s)`
-- `traveler(s)`
-- `travel-type`
-- `itinerary`
-- `reimbursed-for`
-- `who-paid`
-- `comment`

- Part 7. Liabilities
`rows`:
-- `incurred`
-- `debtor`
-- `type`
-- `points`
-- `rate(term)`
-- `amount`
-- `creditor`
-- `comments`

- Part 8. Positions
`rows`:
-- `position-dates`
-- `position-held`
-- `entity`
-- `entity-type`
-- `comments`

- Part 9. Agreements
`rows`:
-- `date`
-- `parties-involved`
-- `type`
-- `status-and-terms`

- Part 10. Compensation
- Attachments & Comments
`rows`:
-- `document-title`
-- `document-url`
-- `date-time-added`

If PTR
- Transactions
`rows`:
-- `transaction-date`
-- `owner`
-- `ticker`
-- `asset-name`
-- `asset-type`
-- `transaction-type`
-- `amount`
-- `comment`
