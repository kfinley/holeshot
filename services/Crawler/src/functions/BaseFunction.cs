using Amazon.SimpleNotificationService;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using MediatR;

using ServiceProviderFunctions;

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
        .AddAWSService<IAmazonSimpleNotificationService>(configuration.GetAWSOptions("Service:SNS"))
        .AddMediatR(Aws.Commands.CommandsAssembly.Value);
    }
  }
}
