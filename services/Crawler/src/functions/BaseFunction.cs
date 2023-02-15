using Amazon.SimpleNotificationService;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using MediatR;

using ServiceProviderFunctions;
using Holeshot.Crawler.Commands;
using Amazon.S3;

namespace Holeshot.Crawler.Functions {
  public abstract class BaseFunction : ServiceProviderFunction {
    protected IMediator Mediator {
      get {
        return Scope.ServiceProvider.GetService<IMediator>();
      }
    }

    protected override void ConfigureServices(IServiceCollection serviceCollection, IConfiguration configuration) {

      serviceCollection
        .AddOptions()
        .AddDefaultAWSOptions(configuration.GetAWSOptions())
        .AddAWSService<IAmazonSimpleNotificationService>(configuration.GetAWSOptions("Services:SNS"))
        .AddAWSService<IAmazonS3>()
        .Configure<Settings>(configuration.GetSection("Services:Crawler"))
        .AddMediatR(Aws.Commands.CommandsAssembly.Value)
        .AddMediatR(Crawler.Commands.CommandsAssembly.Value);
    }
  }
}
