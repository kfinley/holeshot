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

  public class ProcessTrackRequest : IRequest<ProcessTrackResponse> {
    public string Contents { get; set; }
    public string BucketName { get; set; }
  }

  public class ProcessTrackResponse {
    public bool Success { get; set; }
    public string Key { get; set; }
    public TrackInfo TrackInfo { get; set; }
  }

  public class ProcessTrackHandler : Crawly, IRequestHandler<ProcessTrackRequest, ProcessTrackResponse> {

    public ProcessTrackHandler(IMediator mediator, IOptions<Settings> settings, JsonSerializerOptions jsonOptions) : base(mediator, settings.Value, jsonOptions) { }

    /// <summary>
    /// Processes USA Bikes 'site/tracks' pages. i.e. /site/tracks/568?section_id=1
    /// </summary>
    public async Task<ProcessTrackResponse> Handle(ProcessTrackRequest request, CancellationToken cancellationToken) {

      var key = string.Empty;

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

        var helper = new HtmlHelper();

        var trackLogoUrl = helper.GetTrackLogoUrl(siteTracksDoc);

        var mapLink = helper.GetMapLink(siteTracksDoc, trackLogoUrl.HasValue());
        var gps = helper.GetGps(siteTracksDoc, mapLink);
        var trackId = helper.GetTrackId(siteTracksDoc, trackLogoUrl.HasValue());

        var tracksPageContent = await GetTracksPage(this.settings.BaseUrl, trackId);

        if (tracksPageContent == string.Empty) {
          Console.WriteLine("tracksPageContent was empty");

          return new ProcessTrackResponse {
            Success = false,
          };
        }

        var tracksPageDoc = await context.OpenAsync(req => req.Content(tracksPageContent));

        // var eventsUrl = base.GetUniqueHrefUrls("/events/schedule", request.Contents).First();

        var trackInfo = new TrackInfo {
          Name = helper.GetTrackName(siteTracksDoc),
          District = helper.GetTrackDistrict(siteTracksDoc),
          TrackId = trackId,
          ContactInfo = helper.GetContactInfo(siteTracksDoc),
          LogoUrl = trackLogoUrl,
          Location = new Location {
            Address = helper.GetAddress(siteTracksDoc, trackLogoUrl.HasValue()),
            MapLink = mapLink,
            GPS = new GPS {
              Lat = gps.Item1,
              Long = gps.Item2,
            }
          },
          Website = helper.GetWebsite(siteTracksDoc, trackLogoUrl.HasValue()),
          HtmlDescription = helper.GetDescription(siteTracksDoc),
          Socials = helper.GetSocials(tracksPageDoc),
          Sponsors = helper.GetSponsors(tracksPageDoc),
          Coaches = helper.GetCoaches(tracksPageDoc, this.settings.BaseUrl),
          Operators = helper.GetOperators(tracksPageDoc)
        };

        key = $"encoded/tracks/{trackId}/trackInfo.json";

        var content = base.Serialize(trackInfo);

        await this.mediator.Send(new PutS3ObjectRequest {
          BucketName = request.BucketName,
          Key = key,
          Content = content
        });

        return new ProcessTrackResponse {
          Success = true,
          Key = key,
          TrackInfo = trackInfo
        };

      } catch (Exception ex) {

        Console.WriteLine("ProcessTrackHandler Failed!");
        Console.WriteLine(ex);
      }

      return new ProcessTrackResponse {
        Success = false
      };
    }

    private async Task<string> GetTracksPage(string baseUrl, string trackId) {
      var url = $"https://{baseUrl}/tracks/{trackId}";
      var key = $"sources/USA-BMX/tracks/{trackId}/page.html";

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
