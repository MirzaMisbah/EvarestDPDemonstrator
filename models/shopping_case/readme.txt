*****Information about training model*****

Task: To predict whether the user is receptive to offers (when the customer is moving slowly) or not(when the customer is moving fastly).
Related Files:
record.csv, index.html and script.js

Data: record.csv
Data is collected using Androsenor app
Columns: Linear Acceleration-X,Y,Z, Location-Latitude, Longitude,Timestamp
Annotation: 0(user moving slowly -> receptivesss for offers), 1(user moving fastly -> non-receptiveness)
Data collection information:
Frequency of data collection: 10 Hz (10 datapoints in one second)
Window Size: 10 seconds 
No of data points per sample: 10*10= 100
Number of samples: 20


Libraries used: tfjs, tf-vis.js (tensorflow.js and tensorflow-visualisation.js)

Model: script.js
Input: Processed data (Data has been processed manually from record.csv)
Input columns: [LinACC X, LinACC Y, LinACC Z, Change in Latitude, Change in Longitude]
Labels: [Annotation]
No of training samples: 15
NO of testing samples: 5
Shape of each training sample: [1 100 5]


*****To run the code****
1. Click on index.html file in the same folder.
2. Right click and Inspect

