# Crawler Service

The Crawler Service is a distributed web crawler that pulls public BMX data. Below is a high level sequence diagram of how the process works.

```mermaid
sequenceDiagram
    participant Client
    participant ApiGateway / WebSockets
    participant GetTracksForRegion Lambda
    participant S3
    participant SaveTrackEvents Lambda
    participant DecodeEmails Lambda
    participant SaveTrackInfo Lambda
    participant DynamoDB
    Client->>ApiGateway / WebSockets: Send: GetTracksForRegion
    ApiGateway / WebSockets->>GetTracksForRegion Lambda: Run GetTracksForRegion
    GetTracksForRegion Lambda->>S3: Save Search Page
    GetTracksForRegion Lambda->>S3: Save Track Page
    GetTracksForRegion Lambda->>S3: Save Events Pages (monthly until EOY)
    GetTracksForRegion Lambda->>S3: Save /encoded/tracks/{trackId}/trackInfo.json
    GetTracksForRegion Lambda->>S3: Save /events/tracks/{trackId}/events/{year}.{month}.json
    S3->>SaveTrackEvents Lambda: Trigger: events/*
    SaveTrackEvents Lambda->>DynamoDB: Save events in Core table
    S3->>DecodeEmails Lambda: Trigger: encoded/*
    DecodeEmails Lambda->>S3: Save /tracks/{trackId}/trackInfo.json
    S3->>SaveTrackInfo Lambda: Trigger: tracks/*
    SaveTrackInfo Lambda->>DynamoDB: Save trackInfo in Core table
    SaveTrackInfo Lambda->>DynamoDB: Save track location in Geo table
```

## Crawler Process Overview

The process is kicked off by a Lambda Function fired from an API Gateway WebSocket request. This Lambda saves files in S3 and triggers fire more Lambda Functions that process the data.

The Crawler works by downloading a search result page to S3 and then processes the page. Individual track pages are also downloaded as well as individual calendar pages for those tracks. Calendar pages are downloaded from the current month to the end of the year. The HTML pages are parsed and the output is saved in json format in an S3 bucket. Several S3 triggers are in place that process the json files as they are saved in S3. This is basically a fan out distributed crawler setup where Lambda functions are fired and run concurrently to process each track and the tracks events by month.

## Crawler Process Details
There are 4 Lambda functions that do the work
* GetTracksForRegion (.net core 6)
* DecodeEmails (python 3.8)
* SaveTrackInfo (node 18 / TypeScript)
* SaveTrackEvents (node 18 / TypeScript)

The GetTracksForRegion Lambda kicks off the process and does the work of downloading the raw HTML pages into S3, processing these pages, and saving trackInfo.json and event json files. Events are downloaded and saved by month.

Email addresses are encoded using web-scrapping protection 😏... so we decode these email addresses using a one liner python call. An S3 trigger is in place to fire when any file hits the `encoded/` path in our S3 bucket. The DecodeEmails Lambda Function saves the trackInfo.json file in the `tracks/` path in the S3 bucket.

The `tracks/` path has a trigger in place which fires the SaveTrackInfo Lambda. This function loads the trackInfo.json file and saves the data to both the Core and Geo table in DynamoDB.

The Geo table is a GeoHash lookup enabled table we can use to store points that we want to perform geo searches on. In our case we are interested in types of events (Gold Cup Races) at tracks that are "near" us.

When the events json files are saved to the `events/` path in S3 the SaveTrackEvents Lambda Function fires and saves each event into the Core DynamoDB table.
