using System;
using System.Text.Json;

using Microsoft.Extensions.Logging;

using MediatR;

using Holeshot.Aws.Commands;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Extensions.Options;

namespace Holeshot.Crawler.Commands {

  public class GetTracksForRegionRequest : IRequest<GetTracksForRegionResponse> {
    public string Region { get; set; } // Can be state or country. USA will get all the tracks in the US
  }

  public class GetTracksForRegionResponse {
    public bool Success { get; set; }
  }

  public class GetTracksForRegionHandler : Crawly, IRequestHandler<GetTracksForRegionRequest, GetTracksForRegionResponse> {

    private readonly ILogger<GetTracksForRegionHandler> logger;

    public GetTracksForRegionHandler(IMediator mediator,
                                    IOptions<Settings> settings,
                              ILogger<GetTracksForRegionHandler> logger) : base(mediator, settings.Value) {
      this.logger = logger;
    }

    public async Task<GetTracksForRegionResponse> Handle(GetTracksForRegionRequest request, CancellationToken cancellationToken) {

      this.logger.LogInformation($"Processing GetTracksForStateRequest for region: {request.Region}");

      var url = $"https://{this.settings.BaseUrl}/tracks/search?location={request.Region.Replace(" ", "%20")}&distance=25000&commit=Search";

      var key = $"USA-BMX/tracks/search/{request.Region}";

      var file = await base.mediator.Send(new S3ObjectExistsRequest {
        Bucket = this.settings.Bucket,
        Key = key
      });

      if (!file.Exists) {
        var downloadToS3Request = await base.mediator.Send(new DownloadToS3Request {
          Bucket = this.settings.Bucket,
          Key = key,
          ContentType = "text/html",
          Url = url
        });
      }

      var gets3ObjectResponse = await base.mediator.Send(new GetS3ObjectRequest {
        Key = key,
        Bucket = this.settings.Bucket
      });

      if (gets3ObjectResponse.Contents != string.Empty) {
        var urls = base.GetUniqueHrefUrls("/site/tracks/", gets3ObjectResponse.Contents);

        this.logger.LogInformation($"Processing {urls.Count()} 🚲 tracks in {request.Region}");

        await base.GetPages(urls, async (page) => {
          try {
            var content = page.Item2;
            // Process each track on the page

            await base.mediator.Send(new ProcessTrackPageRequest {
              Contents = content
            });

          } catch (Exception ex) {
            this.logger.LogInformation(ex.Message);
            this.logger.LogInformation(ex.StackTrace);

          }
          return false; // this return really doesn't mean anything. it should probably return true....
        },
          $"https://{this.settings.BaseUrl}"
          );

        await this.mediator.Publish(new PublishMessageRequest {
          Topic = "GetTracksForStateTopic",
          Subject = "Tracks/getTrackForState",
          // To avoid dealing with mapping and setting naming option to camel case
          // just new up the message with camel casing.
          Message = JsonSerializer.Serialize(new {
            State = request.Region
          })
        });

        return new GetTracksForRegionResponse {
          Success = true
        };
      } else {
        return new GetTracksForRegionResponse {
          Success = false
        };
      }
    }
  }
}
