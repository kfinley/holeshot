using System;
using System.Text.Json;

using Microsoft.Extensions.Logging;

using MediatR;

using Holeshot.Aws.Commands;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace Holeshot.Crawler.Commands {

  public class GetTracksForStateRequest : IRequest<GetTracksForStateResponse> {
    public string State { get; set; }
    public string BaseUrl { get; set; }
  }

  public class GetTracksForStateResponse {
    public bool Success { get; set; }
  }

  public class GetTracksForStateHandler : CrawlerBase, IRequestHandler<GetTracksForStateRequest, GetTracksForStateResponse> {
    private readonly ILogger<GetTracksForStateHandler> logger;

    public GetTracksForStateHandler(IMediator mediator,
                              ILogger<GetTracksForStateHandler> logger) : base(mediator) {
      this.logger = logger;
    }

    public async Task<GetTracksForStateResponse> Handle(GetTracksForStateRequest request, CancellationToken cancellationToken) {

      this.logger.LogInformation($"Processing GetTracksForStateRequest for state: {request.State}");

      var url = $"https://{request.BaseUrl}/tracks/search?location={request.State.Replace(" ", "%20")}&distance=25000&commit=Search";

      var downloadToS3Request = await base.mediator.Send(new DownloadToS3Request {
        Bucket = "xxxxxxxxxxxxxxxx",
        Key = $"USA-BMX/tracks/search/{request.State}",
        ContentType = "text/html",
        Url = url
      });

      var gets3ObjectResponse = await base.mediator.Send(new GetS3ObjectRequest {
        Key = $"USA-BMX/tracks/search/{request.State}",
        Bucket = "xxxxxxxxxxxxxxxx"
      });

      if (gets3ObjectResponse.Contents != string.Empty) {
        var urls = base.GetUniqueHrefUrls("/site/tracks/", gets3ObjectResponse.Contents);

        Console.WriteLine(string.Empty);
        Console.WriteLine($"Processing {urls.Count()} 🚲 tracks in {request.State}");
        Console.WriteLine(string.Empty);

        await base.GetPages(urls, async (page) => {
          try {
            var content = page.Item2;
            // Process each track on the page

            await base.mediator.Send(new ProcessTrackPageRequest {
              BaseUrl = request.BaseUrl,
              Contents = content
            });

          } catch (Exception ex) {
            Console.WriteLine(ex.Message);
            Console.WriteLine(ex.StackTrace);

          }
          return false;
        },
          $"https://{request.BaseUrl}"
          );

        await this.mediator.Publish(new PublishMessageRequest {
          Topic = "GetTracksForStateTopic",
          Subject = "Tracks/getTrackForState",
          // To avoid dealing with mapping and setting naming option to camel case
          // just new up the message with camel casing.
          Message = JsonSerializer.Serialize(new {
            State = request.State
          })
        });

        return new GetTracksForStateResponse {
          Success = true
        };
      } else {
        return new GetTracksForStateResponse {
          Success = false
        };
      }
    }
  }
}
