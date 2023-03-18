# Holeshot BMX

Work in progress... [holeshot-bmx.com](holeshot-bmx.com)

## Repo Details

This is a multi-language mono repo with a CI/CD pipeline deploying to AWS. The front end is built using VueJS and TypeScript. The Backend is running as serverless functions using AWS Lambda Functions. There is a minimal Rest API and the application works using WebSockets on top fo ApiGateway for just about everything.

The following tech is used in the system
* VueJS
  * Vuex
* Lambda Functions (.net 6.0, Python, Node using TypeScript)
* AWS CDK
* AWS SDK JS v3
* TypeScript
  * Inversify - Dependency Injection
* .net core
  * Mediator
  * AngleSharp
* Step Functions
* DynamoDb - Single Table design as well as a geohash enabled entity table
* S3
* SNS
* SES
