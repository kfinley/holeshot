using Amazon.SimpleNotificationService;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using MediatR;
using Amazon.S3;

using ServiceProviderFunctions;

using Holeshot.Crawler.Commands;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace Holeshot.Crawler.Functions {
  public abstract class BaseFunction : ServiceProviderFunction {
    protected IMediator? Mediator {
      get {
        return Scope.ServiceProvider.GetService<IMediator>();
      }
    }

    protected override void ConfigureServices(IServiceCollection serviceCollection, IConfiguration configuration) {

      serviceCollection
        .AddOptions()
        .AddDefaultAWSOptions(configuration.GetAWSOptions())
        .AddAWSService<IAmazonSimpleNotificationService>(configuration.GetAWSOptions())
        .AddAWSService<IAmazonS3>(configuration.GetAWSOptions())
        .Configure<Settings>(configuration.GetSection("Services:Crawler"))
        .AddMediatR(Aws.Commands.CommandsAssembly.Value)
        .AddMediatR(Crawler.Commands.CommandsAssembly.Value);
    }
  }
}
