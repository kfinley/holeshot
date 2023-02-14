using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using AngleSharp;
using MediatR;
using Microsoft.Extensions.Options;

namespace Holeshot.Crawler.Commands {

  public class ProcessTrackPageRequest : IRequest<ProcessTrackPageResponse> {
    public string Contents { get; set; }
  }

  public class ProcessTrackPageResponse {
    public bool Success { get; set; }
  }

  public class ProcessTrackPageHandler : Crawly, IRequestHandler<ProcessTrackPageRequest, ProcessTrackPageResponse> {

    public ProcessTrackPageHandler(IMediator mediator, IOptions<Settings> settings) : base(mediator, settings.Value) { }

    /// <summary>
    /// Processes USA Bikes 'site/tracks' pages. i.e. /site/tracks/568?section_id=1
    /// </summary>
    public async Task<ProcessTrackPageResponse> Handle(ProcessTrackPageRequest request, CancellationToken cancellationToken) {
      //    public async Task<bool> Process(string baseUrl, string content, bool useProxy, string rootFolder, bool useExistingFileIfPresent) {

      if (request.Contents == string.Empty) {
        Console.WriteLine("Content is empty");

        return new ProcessTrackPageResponse {
          Success = false
        };
      }
      //Use the default configuration for AngleSharp
      var config = Configuration.Default;

      //Create a new context for evaluating webpages with the given config
      var context = BrowsingContext.New(config);

      //Just get the DOM representation
      var document = await context.OpenAsync(req => req.Content(request.Contents));

      //Serialize it back to the console
      // Console.WriteLine(document.DocumentElement.OuterHtml);

      var name = document.QuerySelector("#main_content > h1").FirstChild.TextContent.Trim();
      Console.WriteLine($"Name: {name}");
      var district = document.QuerySelector("#track_district").TextContent.Split(':')[1].Trim();
      Console.WriteLine($"District: {district}");
      Console.WriteLine(string.Empty);

      var contactInfoElements = document.QuerySelector("div#track_contact ul.no-style").Children;

      var contactInfo = new Dictionary<string, string>();

      contactInfoElements.ForEach(e => {
        var info = e.TextContent.Split(':');
        var val = info[1].Trim();

        if (val.StartsWith("[email")) {
          var node = e.InnerHtml;
          var encEmail = e.Children[1].Attributes[2].Value;

          Console.WriteLine($"CloudFlare Encoded Email: {encEmail}");
          Console.WriteLine($"Decocded {info[0].Trim()}:");










          //TODO: deal with hardcoded path
          // var email = base.RunShellCmd($"/Users/rkf/projects/Crawly/decCFEmail.py", encEmail);

        } else {
          contactInfo.Add(info[0].Trim(), info[1].Trim());
          Console.WriteLine($"{info[0].Trim()}: {info[1].Trim()}");
        }
      });

      // Track logo URL
      var trackLogo = document.QuerySelector("#track_location > img");
      var hasLogo = true;
      if (trackLogo != null) {
        var trackLogoUrl = trackLogo.Attributes["src"].Value;
        Console.WriteLine(string.Empty);
        Console.WriteLine($"Track Logo Url: https:{trackLogoUrl}");
      } else {
        hasLogo = false;
      }

      var childIndex = hasLogo ? 3 : 2;
      var locationInfo = document.QuerySelector($"#track_location > p:nth-child({childIndex})").InnerHtml.Split("<br>");
      var address = new {
        Line1 = string.Empty,
        Line2 = string.Empty,
        City = string.Empty,
        State = string.Empty,
        Zipcode = string.Empty
      };

      if (locationInfo.Count() == 2) { // Assume city, state state zip, country only
        address = new {
          Line1 = string.Empty,
          Line2 = string.Empty,
          City = locationInfo[0].Split(',')[0],
          State = locationInfo[0].Split(", ")[1].Split(' ')[0],
          Zipcode = locationInfo[0].Split(", ")[1].Split(' ')[1]
        };
      } else if (locationInfo.Count() == 3) { // Assume Line1, city state zip, country
        address = new {
          Line1 = locationInfo[0],
          Line2 = string.Empty,
          City = locationInfo[1].Split(',')[0],
          State = locationInfo[1].Split(", ")[1].Split(' ')[0],
          Zipcode = locationInfo[1].Split(", ")[1].Split(' ')[1]
        };

      } else if (locationInfo.Count() == 4) {
        address = new {
          Line1 = locationInfo[0],
          Line2 = locationInfo[1],
          City = locationInfo[2].Split(',')[0],
          State = locationInfo[2].Split(", ")[1].Split(' ')[0],
          Zipcode = locationInfo[2].Split(", ")[1].Split(' ')[1]
        };
      }


      Console.WriteLine(string.Empty);
      Console.WriteLine($"Address:");
      Console.WriteLine($"Line1: {address.Line1}");
      Console.WriteLine($"Line2: {address.Line2}");
      Console.WriteLine($"City: {address.City}");
      Console.WriteLine($"State: {address.State}");
      Console.WriteLine($"Zipcode: {address.Zipcode}");
      Console.WriteLine(string.Empty);

      childIndex = hasLogo ? 5 : 4;
      var mapLink = document.QuerySelector($"#track_location > p:nth-child({childIndex}) > a")?.Attributes[0].Value;
      Console.WriteLine($"Map Link: {mapLink}");
      Console.WriteLine(string.Empty);

      var locs = mapLink.Split('?')[1].Split('&')[0].Replace("q=", string.Empty).Split(',');
      var gps = new Tuple<string, string>(locs[0], locs[1]);

      Console.WriteLine($"GPS: Lat {gps.Item1}, Long {gps.Item2}");
      Console.WriteLine(string.Empty);

      childIndex = hasLogo ? 6 : 5;
      var website = document.QuerySelector($"#track_location > p:nth-child({childIndex}) > a")?.Attributes[0]?.Value;
      if (website != null) {
        Console.WriteLine($"Website: {website}");
        Console.WriteLine(string.Empty);
      }

      var trackContactSection = document.QuerySelector("#track_contact");
      var descriptionList = new List<string>();

      for (int i = 2; i < trackContactSection.Children.Count(); i++) {
        descriptionList.Add(trackContactSection.Children[i].InnerHtml);
      }

      Console.WriteLine("Description [HTML]:");
      descriptionList.ForEach(x => Console.WriteLine(x));

      childIndex = hasLogo ? 4 : 3;
      var scheduleLink = document.QuerySelector($"#track_location > p:nth-child({childIndex}) > a")?.Attributes[0]?.Value;
      var trackId = scheduleLink.Split('/')[2];

      Console.WriteLine(string.Empty);
      try {

        var tracksPageContent = await GetTracksPage(this.settings.BaseUrl, trackId);

        if (tracksPageContent == string.Empty) {
          Console.WriteLine("tracksPageContent was empty");
        } else {

          var tracksPageDoc = await context.OpenAsync(req => req.Content(tracksPageContent));

          // Socials
          var socials = new Dictionary<string, string>(); // Name | Url

          var socialsList = tracksPageDoc.QuerySelector("#social-links-wrap > ul");

          socialsList?.Children?.ForEach(li => {
            socials.Add(li.Id, li.Children[0].Attributes[0].Value);
          });

          if (socials.Count() > 0) {

            Console.WriteLine("Socials:");
            socials.ForEach(s => Console.WriteLine(s));
          }

          // Sponsors
          // css: #sponsors-desktop

          var sponsors = new Dictionary<string, string>(); // Name | Url

          var sponsorsList = tracksPageDoc.QuerySelector("#sponsors-desktop");

          var sponsorIndex = 1;

          sponsorsList?.Children?.ForEach(el => {
            var name = string.Empty;

            switch (el.TagName) {
              case "H2":
                break;
              case "A":
                /*
                  Sometimes they use an anchor with an email as the href. Totally stupid and wrong and results in 404s but that's what they do.
                  Example: http://www.cedarbmx.com/ has a sponsor with a link of https://www.usabmx.com/tracks/dhillandson@aol.com

                  Sometimes the sponsor links are just totally fucked up.
                  Example: http://www.cedarbmx.com/ has a sponsor with a link of https://www.usabmx.com/tracks/570%20840%200433
                */
                try {
                  name = el.Attributes["title"].Value != string.Empty ? el.Attributes["title"].Value : el.Attributes["href"].Value.Split('/')[2];
                } catch (Exception) {
                  name = "Unknown";
                }
                if (!sponsors.TryAdd(name, el.Attributes["href"].Value.TrimEnd(new[] { '/' }))) {
                  sponsors.Add(name + sponsorIndex, el.Attributes["href"].Value.TrimEnd(new[] { '/' }));
                }
                break;
              case "IMG":
                try {
                  name = el.Attributes["alt"].Value != string.Empty ? el.Attributes["alt"].Value : el.Attributes["src"].Value.Split('/')[5];
                } catch (Exception) {
                  name = "Unknown";
                }
                if (!sponsors.TryAdd(name, el.Attributes["src"].Value)) {
                  sponsors.Add(name + sponsorIndex, el.Attributes["src"].Value);
                }
                break;
              default:
                name = el.InnerHtml;
                break;
            }
            sponsorIndex++;
          });

          if (sponsors.Count() > 0) {

            Console.WriteLine("Sponsors:");
            sponsors.ForEach(s => Console.WriteLine(s));
          }

          // Coaches:
          // css: #contact-us > p:nth-child(6)
          var coaches = new Dictionary<string, string>(); // Name | Profile URL

          var coachesList = tracksPageDoc.QuerySelector("#contact-us > p:nth-child(6)");

          coachesList?.Children?.ForEach(el => {
            var name = string.Empty;

            switch (el.TagName) {
              case "STRONG":
                if (el.TextContent != "Coaches:")
                  throw new Exception("COACHES ELEMENT WRONG!!");
                break;
              case "A":
                coaches.Add(el.TextContent, $"https://{this.settings.BaseUrl}{el.Attributes["href"].Value}");
                break;
              case "BR":
                break;
              default:
                Console.WriteLine(el.TagName);
                Console.WriteLine(el.InnerHtml);
                break;
            }
          });

          if (coaches.Count() > 0) {

            Console.WriteLine("Coaches:");
            coaches.ForEach(c => Console.WriteLine(c));
          }

          // Track operator
          var trackOperators = new List<string>();

          var trackOperator = tracksPageDoc.QuerySelector("#contact-us > p:nth-child(4)");

          if (trackOperator != null && trackOperator.HasChildNodes) {

            Console.WriteLine("Track Operators:");
            trackOperators = trackOperator.InnerHtml.Replace("<strong>Track Operator:</strong>", string.Empty)
                                                .Replace(@"<br />\n<br />", string.Empty)
                                                .Replace("\n", string.Empty)
                                                .Split("<br>")
                                                .Skip(1)
                                                .ToList();

            if (trackOperators.Count() > 0) {
              trackOperators.ForEach(op => {
                if (op.Contains("email-protection#")) {

                  //Console.WriteLine(op);
                  // Example
                  // "<a href=\"/cdn-cgi/l/email-protection#5022232a31232a6761656910313f3c7e333f3d\"><span class=\"__cf_email__\" data-cfemail=\"4f3d3c352e3c35787e7a760f2e2023612c2022\">[email&nbsp;protected]</span></a>"

                  var cfemail = op.Split("data-cfemail=")[1];
                  var end = cfemail.IndexOf("[email") - 3;
                  var encEmail = cfemail.Substring(1, end);

                  Console.WriteLine($"CloudFlare Encoded Email: {encEmail}");
                  Console.WriteLine("Decoded Email:");

                  // op = base.RunShellCmd($"/Users/rkf/projects/Crawly/decCFEmail.py", encEmail);
                } else {
                  Console.WriteLine(op);
                }
              });
            }
          }

          Console.WriteLine(string.Empty);

          var eventsUrl = base.GetUniqueHrefUrls("/events/schedule", request.Contents).First();
          Console.WriteLine($"Events URL: {eventsUrl}");

          var eventsPageContent = await GetEventsPage(this.settings.BaseUrl, trackId);

          if (eventsPageContent == string.Empty) {
            Console.WriteLine("eventsPageContent was empty");
          } else {

            var eventsPageDoc = await context.OpenAsync(req => req.Content(eventsPageContent));

            var eventsElement = eventsPageDoc.QuerySelectorAll("td:has(a)");

            var events = ListLike.This(new {
              Name = string.Empty,
              Date = DateTime.Now,
              Url = string.Empty,
              Details = new List<Tuple<string, string>>()
            });

            eventsElement.ForEach(async e => {
              var cssClassDateParts = e.Attributes["class"].Value.Split(' ')[1].Split('_');
              var date = DateTime.Parse($"{cssClassDateParts[2]}/{cssClassDateParts[3]}/{cssClassDateParts[1]}");

              var doc = await e.AsDocument();
              var calEvent = doc.QuerySelector(".calendar-event");

              var link = doc.QuerySelector("a");
              var eventUrl = link.Attributes["href"].Value;
              var eventTitle = link.TextContent;

              var eventToolTip = doc.QuerySelector(".tooltip_body");
              var eventDetailsParsed = eventToolTip.InnerHtml
                                                    .Replace("<p>", string.Empty)
                                                    .Replace("</p>", string.Empty)
                                                    .Replace("<strong>", string.Empty)
                                                    .Replace("</strong>", string.Empty)
                                                    .Replace("<br>", string.Empty)
                                                    .Replace("\n\n", "\n");
              var eventsList = eventDetailsParsed.Split("\n");

              var eventsDict = new List<Tuple<string, string>>();

              eventsList.ForEach(e => {
                if (e != string.Empty) {
                  var eventDetails = e.Split(": ");
                  if (eventDetails.Count() > 1)
                    eventsDict.Add(new Tuple<string, string>(eventDetails[0], eventDetails[1]));

                }
              });

              events.Add(new {
                Name = eventTitle,
                Date = date,
                Url = eventUrl,
                Details = eventsDict
              });
            });

            if (events.Count == 0) {

              Console.WriteLine($"No events for {eventsUrl}");
            } else {

              Console.WriteLine("Events");

              events.ForEach(e => {
                Console.WriteLine($"Name: {e.Name}");
                Console.WriteLine($"Date: {e.Date.ToLongDateString()}");
                Console.WriteLine($"Url: {this.settings.BaseUrl}{e.Url}");
                Console.WriteLine($"Details");
                e.Details.ForEach(d => Console.WriteLine($"{d.Item1}: {d.Item2}"));

              });
            }
          }


          // Latest News
          // css: #news


          // Standings

          // /tracks/1851/leaderboards?age_group=&page=1&points_type=E&proficiency_name=&season=&section_id=1

        }
      } catch (Exception ex) {

        Console.WriteLine("GetTracksPage Failed!");
        Console.WriteLine(ex);

        // using (TextWriter tw = new StreamWriter($"{ExePath}/Results/Failed-Pages.txt", true)) {
        //   tw.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} GetTracksPage Failed! https://www.usabmx.com/tracks/{trackId}?section_id=1 ERROR: {ex.Message} {(ex.InnerException != null ? new string("Inner Exception: ") + ex.InnerException.Message : String.Empty)}");
        // }

      }




      /*

      Schedule
      NOTE: The ID in the schedule URL gives us the track ID in the other '/tracks' system.
      css: div#track_location p a:nth-child(0)
      <a href="/tracks/1859/events/schedule" onclick="window.open(this.href);return false;">View Schedule</a>

      Logo
      css: div#track_location img#track_logo
      <img alt="Fountain City BMX" id="track_logo" src="//s3.amazonaws.com/bmxwebserverprod/attachments/358059/Red_White_Blue_Logo_2020_mxw200_mxha_e0.png">
      <img alt="Capital City BMX" id="track_logo" src="//s3.amazonaws.com/bmxwebserverprod/attachments/264261/Capital_City_BMX_logo_mxw200_mxha_e0.png">

      */

      /*
      USA Bikes '/tracks' system
      /tracks/1971


      Location
      css: #contact-us > p:nth-child(3)
      <p>
      <strong>Location</strong>
      <br>

      Map link css: #contact-us > p:nth-child(3) > a:nth-child(5)


      */



      return new ProcessTrackPageResponse {
        Success = true
      };
    }

    /// <summary>
    /// Parses the '/tracks/{id}' page
    /// </summary
    private async Task<string> GetTracksPage(string baseUrl, string trackId) {

      var uri = $"https://{baseUrl}/tracks/{trackId}";
      var segments = uri.Split('/');

      var title = $"USA-BMX/tracks/{trackId}";
      // await Task.Delay(Numbers.RandomBetween(2000, 4000)); // Suckfest... Force wait to try to get around rate limiter

      var result = await this.mediator.Send(new GetPageRequest {
        Url = uri,
        Key = title
      });

      // var result = await new GetPage().Process(uri, useProxy, rootFolder, title);

      return result.Contents;

    }

    private async Task<string> GetEventsPage(string baseUrl, string trackId) {

      var uri = $"https://{baseUrl}/tracks/{trackId}/events/schedule";
      var title = $"tracks.{trackId}.events";

      // await Task.Delay(Numbers.RandomBetween(2000, 4000)); // Suckfest... Force wait to try to get around rate limiter

      var result = await this.mediator.Send(new GetPageRequest {
        Url = uri,
        Key = title
      });
      // var result = await new GetPage().Process(uri, useProxy, rootFolder, title);

      return result.Contents;
    }


  }
}

