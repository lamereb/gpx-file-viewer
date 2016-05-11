## GPX File Viewer

Node.js Express framework serving a page that uses the Google Map API to plot the coordinates of an uploaded .gpx or .tcx file, and plotly.js to trace distance, elevation (and pace). Mousing over the plotly.js moves a cursor on the map, indicating its GPS coordinates.

When a .tcx or .gpx file is uploaded, Node.js executes the perl script, coords.pl, that extracts latitude/longitude, elevation, and timestamp information from the .gpx/.tcx XML and generates a JSON file for use in map and plot generation. A running pace was calculated and inserted into the JSON in an earlier branch, but it was not a very telling data-point (the pace just stabilized less than halfway into a run, with little indication of real-time speed increase/decrease): this would need to be tweaked for accuracy, and anyway (at least with the GPS watch that I have), pace data is stored along with HR and cadence in .csv file separate from the GPS data.

![screenshot](screenshot.jpg)
