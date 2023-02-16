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
    public string Type { get; set; } = "State";
    public string Region { get; set; }
    public string Distance { get; set; } = "25000";
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

      // this.logger.LogInformation($"Processing GetTracksForStateRequest for region: {request.Region}");

      var url = $"https://{this.settings.BaseUrl}";

      if (request.Type == "State") {
        url += $"/tracks/by_state?state={request.Region}";
      } else {
        url += $"/tracks/search?location={request.Region.Replace(" ", "%20")}&distance={request.Distance}&commit=Search";
      }

      var key = $"USA-BMX/tracks/search/{request.Region}";

      var file = await base.mediator.Send(new S3ObjectExistsRequest {
        BucketName = this.settings.BucketName,
        Key = key
      });

      if (!file.Exists) {
        var downloadToS3Request = await base.mediator.Send(new DownloadToS3Request {
          BucketName = this.settings.BucketName,
          Key = key,
          ContentType = "text/html",
          Url = url
        });
      }

      var gets3ObjectResponse = await base.mediator.Send(new GetS3ObjectRequest {
        Key = key,
        BucketName = this.settings.BucketName
      });

      if (gets3ObjectResponse.Contents != string.Empty) {
        var urls = base.GetUniqueHrefUrls("/site/tracks/", gets3ObjectResponse.Contents);

        this.logger.LogInformation($"Processing {urls.Count()} 🚲 tracks in {request.Region}");

        await base.GetPages(urls, async (page) => {
          try {
            var content = page.Item2;
            // Process each track on the page

            await base.mediator.Send(new ProcessTrackRequest {
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
          Topic = "Holeshot-GetTracksForRegionTopic",
          Subject = "Tracks/getTrackForRegion",
          // To avoid dealing with mapping and setting naming option to camel case
          // just new up the message with camel casing.
          Message = JsonSerializer.Serialize(new {
            Region = request.Region,
            Tracks = urls.Count()
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
