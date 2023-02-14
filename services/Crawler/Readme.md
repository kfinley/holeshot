# Crawler

This is the web crawler that crawls public websites for data.

## Prereqs:
Install Amazon.Lambda.Tools Global Tools if not already installed.
```
    dotnet tool install -g Amazon.Lambda.Tools
```

If already installed check if new version is available.
```
    dotnet tool update -g Amazon.Lambda.Tools
```

## Commands:

Execute unit tests
```
    cd "tests"
    dotnet test
```

Deploy function to AWS Lambda
```
    cd "src/functions"
    dotnet lambda deploy-function
```
