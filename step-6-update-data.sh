#!/bin/bash
DATE=`date '+%Y-%m-%d %H:%M'`
(cd data && git add output && git commit -m "Files updated at $DATE" && git push origin master)