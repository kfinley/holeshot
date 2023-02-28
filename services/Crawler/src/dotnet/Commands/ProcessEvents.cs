using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json;

using Microsoft.Extensions.Options;

using AngleSharp;
using MediatR;

using Holeshot.Aws.Commands;

namespace Holeshot.Crawler.Commands {

  public class ProcessEventsRequest : IRequest<ProcessEventsResponse> {
    public string TrackId { get; set; }
    public string TrackName { get; set; }
    public string BucketName { get; set; }
  }

  public class ProcessEventsResponse {
    public bool Success { get; set; }
    public string Key { get; set; }
  }

  public class ProcessEventsHandler : Crawly, IRequestHandler<ProcessEventsRequest, ProcessEventsResponse> {
    public ProcessEventsHandler(IMediator mediator, IOptions<Settings> settings, JsonSerializerOptions jsonOptions = null) : base(mediator, settings.Value, jsonOptions) {
    }

    public async Task<ProcessEventsResponse> Handle(ProcessEventsRequest request, CancellationToken cancellationToken) {

      var eventsPageContent = await GetEventsPage(this.settings.BaseUrl, request.TrackId);

      if (eventsPageContent == string.Empty) {
        Console.WriteLine("eventsPageContent was empty");

        return new ProcessEventsResponse {
          Success = false
        };
      }
      //Use the default configuration for AngleSharp
      var config = Configuration.Default;

      //Create a new context for evaluating webpages with the given config
      var context = BrowsingContext.New(config);

      var eventsPageDoc = await context.OpenAsync(req => req.Content(eventsPageContent));

      var events = new HtmlHelper().GetEvents(eventsPageDoc, this.settings.BaseUrl, request.TrackName);

      var key = $"events/tracks/{request.TrackId}/{DateTime.Now.Year}.{DateTime.Now.Month}.json";

      var content = base.Serialize(events);

      await this.mediator.Send(new PutS3ObjectRequest {
        BucketName = request.BucketName,
        Key = key,
        Content = content
      });

      return new ProcessEventsResponse {
        Success = true,
        Key = key
      };

    }

    private async Task<string> GetEventsPage(string baseUrl, string trackId) {

      var url = $"https://{baseUrl}/tracks/{trackId}/events/schedule";
      var key = $"sources/USA-BMX/events/{trackId}/events/{DateTime.Now.Year}.{DateTime.Now.Month}.html";

      var fileMeta = await base.mediator.Send(new S3ObjectExistsRequest {
        BucketName = this.settings.BucketName,
        Key = key
      });

      if (!fileMeta.Exists) {
        var downloadToS3Request = await base.mediator.Send(new DownloadToS3Request {
          BucketName = this.settings.BucketName,
          Key = key,
          ContentType = "text/html",
          Url = url
        });
      }

      var getPage = await this.mediator.Send(new GetPageRequest {
        Url = url,
        Key = key
      });

      return getPage.Contents;
    }
  }

}
