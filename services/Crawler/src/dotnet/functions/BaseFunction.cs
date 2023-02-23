using System.Text.Json;
using Amazon.Lambda.Core;
using Amazon.SimpleNotificationService;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using MediatR;
using Amazon.S3;

using ServiceProviderFunctions;

using Holeshot.Crawler.Commands;

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
        .AddAWSService<IAmazonSimpleNotificationService>(configuration.GetAWSOptions())
        .AddAWSService<IAmazonS3>(configuration.GetAWSOptions())
        .Configure<Settings>(configuration.GetSection("Services:Crawler"))
        .AddMediatR(Aws.Commands.CommandsAssembly.Value)
        .AddMediatR(Crawler.Commands.CommandsAssembly.Value);
    }
  }
}
