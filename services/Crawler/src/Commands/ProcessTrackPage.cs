using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json;

using AngleSharp;
using Holeshot.Aws.Commands;
using MediatR;
using Microsoft.Extensions.Options;

namespace Holeshot.Crawler.Commands {

  public class ProcessTrackPageRequest : IRequest<ProcessTrackResponse> {
    public string Contents { get; set; }
  }

  public class ProcessTrackResponse {
    public bool Success { get; set; }
  }

  public class ProcessTrackHandler : Crawly, IRequestHandler<ProcessTrackPageRequest, ProcessTrackResponse> {

    public ProcessTrackHandler(IMediator mediator, IOptions<Settings> settings) : base(mediator, settings.Value) { }

    /// <summary>
    /// Processes USA Bikes 'site/tracks' pages. i.e. /site/tracks/568?section_id=1
    /// </summary>
    public async Task<ProcessTrackResponse> Handle(ProcessTrackPageRequest request, CancellationToken cancellationToken) {

      if (request.Contents == string.Empty) {
        Console.WriteLine("Content is empty");

        return new ProcessTrackResponse {
          Success = false
        };
      }

      try {

        //Use the default configuration for AngleSharp
        var config = Configuration.Default;

        //Create a new context for evaluating webpages with the given config
        var context = BrowsingContext.New(config);

        //Just get the DOM representation
        var siteTracksDoc = await context.OpenAsync(req => req.Content(request.Contents));

        var trackLogoUrl = siteTracksDoc.GetTrackLogoUrl();

        var mapLink = siteTracksDoc.GetMapLink(trackLogoUrl.HasValue());
        var gps = siteTracksDoc.GetGps(mapLink);
        var trackId = siteTracksDoc.GetTrackId(trackLogoUrl.HasValue());

        var tracksPageContent = await GetTracksPage(this.settings.BaseUrl, trackId);

        if (tracksPageContent == string.Empty) {
          Console.WriteLine("tracksPageContent was empty");

          return new ProcessTrackResponse {
            Success = false
          };

        }

        var tracksPageDoc = await context.OpenAsync(req => req.Content(tracksPageContent));

        var eventsUrl = base.GetUniqueHrefUrls("/events/schedule", request.Contents).First();

        var eventsPageContent = await GetEventsPage(this.settings.BaseUrl, trackId);

        if (eventsPageContent == string.Empty) {
          Console.WriteLine("eventsPageContent was empty");

          return new ProcessTrackResponse {
            Success = false
          };
        }

        var eventsPageDoc = await context.OpenAsync(req => req.Content(eventsPageContent));

        var trackInfo = new {
          Name = siteTracksDoc.GetTrackName(),
          District = siteTracksDoc.GetTrackDistrict(),
          ContactInfo = siteTracksDoc.GetContactInfo(),
          LogoUrl = trackLogoUrl,
          Location = new {
            Address = siteTracksDoc.GetAddress(trackLogoUrl.HasValue()),
            MapLink = mapLink,
            GPS = new {
              Lat = gps.Item1,
              Long = gps.Item2,
            }
          },
          Website = siteTracksDoc.GetWebsite(trackLogoUrl.HasValue()),
          HtmlDescription = siteTracksDoc.GetDescription(),
          Socials = tracksPageDoc.GetSocials(),
          Sponsors = tracksPageDoc.GetSponsors(),
          Coaches = tracksPageDoc.GetCoaches(this.settings.BaseUrl),
          Operators = tracksPageDoc.GetOperators(),
          Events = eventsPageDoc.GetEvents(this.settings.BaseUrl)
        };

        Console.WriteLine($"Track {trackInfo.Name}: {JsonSerializer.Serialize(trackInfo)}");

      } catch (Exception ex) {

        Console.WriteLine("ProcessTrackPageHandler Failed!");
        Console.WriteLine(ex);

        return new ProcessTrackResponse {
          Success = false
        };
      }

      return new ProcessTrackResponse {
        Success = true
      };
    }

    private async Task<string> GetTracksPage(string baseUrl, string trackId) {
      var url = $"https://{baseUrl}/tracks/{trackId}";
      var key = $"USA-BMX/tracks/{trackId}/page";

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

    private async Task<string> GetEventsPage(string baseUrl, string trackId) {

      var url = $"https://{baseUrl}/tracks/{trackId}/events/schedule";
      var key = $"USA-BMX/tracks/{trackId}/events.{DateTime.Now.Month}";

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
