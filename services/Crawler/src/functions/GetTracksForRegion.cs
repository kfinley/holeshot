using Amazon.Lambda.Core;

using Holeshot.Crawler.Commands;

namespace Holeshot.Crawler.Functions {
  public class GetTracksForState : BaseFunction {
    public async Task Handler(GetTracksForRegionRequest @event, ILambdaContext context) => await base.Mediator.Send(@event);
  }
}
