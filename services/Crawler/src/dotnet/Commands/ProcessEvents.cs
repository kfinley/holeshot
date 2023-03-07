using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json;

using Microsoft.Extensions.Options;

using AngleSharp;
using MediatR;

using Holeshot.Aws.Commands;
using System.Collections.Generic;

namespace Holeshot.Crawler.Commands {

  public class ProcessEventsRequest : IRequest<ProcessEventsResponse> {
    public TrackInfo Track { get; set; }
    public string BucketName { get; set; }

  }

  public class ProcessEventsResponse {
    public bool Success { get; set; }
    public List<string> Keys { get; set; }
  }

  public class ProcessEventsHandler : Crawly, IRequestHandler<ProcessEventsRequest, ProcessEventsResponse> {
    public ProcessEventsHandler(IMediator mediator, IOptions<Settings> settings, JsonSerializerOptions jsonOptions = null) : base(mediator, settings.Value, jsonOptions) {
    }

    public async Task<ProcessEventsResponse> Handle(ProcessEventsRequest request, CancellationToken cancellationToken) {

      // get monthly events pages from current month to end of year
      // parse each month's page and save it to a json file in s3

      var year = DateTime.Now.Year;
      var month = DateTime.Now.Month;
      var keys = new List<string>();

      while (month <= 12) {
        var eventsPageContent = await GetEventsPage(this.settings.BaseUrl, request.Track.TrackId, year, month);

        if (eventsPageContent == string.Empty) {
          Console.WriteLine("eventsPageContent was empty");

          return new ProcessEventsResponse {
            Success = false
          };
        }

        var eventsPageDoc = await BrowsingContext
          .New(Configuration.Default)
          .OpenAsync(req => req.Content(eventsPageContent));

        var events = new HtmlHelper().GetEvents(eventsPageDoc, this.settings.BaseUrl, request.Track.Name);

        var key = $"events/tracks/{request.Track.TrackId}/{year}.{month}.json";

        await this.mediator.Send(new PutS3ObjectRequest {
          BucketName = request.BucketName,
          Key = key,
          Content = base.Serialize(new {
            track = request.Track,
            events = events
          })
        });
        keys.Add(key);
        month++;
      }

      return new ProcessEventsResponse {
        Success = true,
        Keys = keys
      };

    }

    private async Task<string> GetEventsPage(string baseUrl, string trackId, int year, int month) {

      // https://www.usabmx.com/tracks/1720/events/schedule?mode=calendar&month=4&year=2023#content-wrap
      // var url = $"https://{baseUrl}/tracks/{trackId}/events/schedule";
      var url = $"https://{baseUrl}/tracks/{trackId}/events/schedule?mode=calendar&month={month}&year={year}#content-wrap";
      var key = $"sources/USA-BMX/events/{trackId}/events/{year}.{month}.html";

      var getPage = await this.mediator.Send(new GetPageRequest {
        Url = url,
        Key = key
      });

      return getPage.Contents;
    }
  }

}
