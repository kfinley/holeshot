using System.Text.Json;
using Amazon.Lambda.Core;
using Amazon.SimpleNotificationService;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using MediatR;
using Amazon.S3;

using ServiceProviderFunctions;

using Holeshot.Crawler.Commands;
using Amazon;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.CamelCaseLambdaJsonSerializer))]

namespace Holeshot.Crawler.Functions {
  public abstract class BaseFunction : ServiceProviderFunction {
    protected IMediator? Mediator {
      get {
        return Scope.ServiceProvider.GetService<IMediator>();
      }
    }

    protected override void ConfigureServices(IServiceCollection serviceCollection, IConfiguration configuration) {

      var serializerOptions = new JsonSerializerOptions() {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
        // DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        MaxDepth = 10,
        // ReferenceHandler = ReferenceHandler.IgnoreCycles,
        WriteIndented = true
      };
      // serializerOptions.Converters.Add(new JsonStringEnumConverter());

      serviceCollection
        .AddOptions()
        .AddSingleton(s => serializerOptions)
        .AddDefaultAWSOptions(configuration.GetAWSOptions())
        .AddAWSService<IAmazonSimpleNotificationService>(configuration.GetAWSOptions("SNS"))
        .AddSingleton<IAmazonS3>(p => {
          var config = new AmazonS3Config {
            RegionEndpoint = RegionEndpoint.USEast1         //TODO:  fix this..
          };
          if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development") {
            config.ForcePathStyle = true;
            var url = configuration.GetSection("S3:ServiceURL").Value;
            config.ServiceURL = url;
          }
          return new AmazonS3Client(config);
        })
        // .AddAWSService<IAmazonS3>(configuration.GetAWSOptions("S3"))
        .Configure<Settings>(configuration.GetSection("Services:Crawler"))
        .AddMediatR(Aws.Commands.CommandsAssembly.Value)
        .AddMediatR(Crawler.Commands.CommandsAssembly.Value);
    }
  }
}
