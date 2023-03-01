

Race Scheduler

A user can search for races and add them to their schedule.


| Access Patterns               | Table/GSI/LSI | Key Condition         | Filter Expression |
|-                              |-              |-                      |-                  |
| Get Events for a given Track  | Table         |  | |
| Get future Events near me     | Table         | GSI1PK begins_with GeoHash and <br/>GSSK >= Current_Date  | |
