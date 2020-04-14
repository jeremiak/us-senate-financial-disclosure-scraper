#!/bin/bash

SECONDS_IN_FIVE_HOURS=18000

while true
do
	echo "Started running at `date '+%Y-%m-%d %H:%M'`"
	npm start
	echo "Stopped running at `date '+%Y-%m-%d %H:%M'`"
	sleep $SECONDS_IN_FIVE_HOURS
done