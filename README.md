
# data_viz
Website url: https://ividim.github.io/DataViz/



### 1. Download files
Download the "pagecounts-{}-{}-views-ge-5.bz2" files from :
https://dumps.wikimedia.org/other/pagecounts-ez/merged/

### 2. Unzip
This command will unzip the file and remove the original file
> bzip2 -d pagecounts-2016-10-views-ge-5.bz2

### 3. Keep only english articles

This command get english articles and write it in a separate file
> grep '^en\.z' pagecounts-2016-10-views-ge-5 >  pagecounts-2016-10-views-ge-5-cleaned

### 4. Get peakday
Execute the wiki/run.py which will keep only articles with certain amount of views and write them in a separate file.
> python run.py


