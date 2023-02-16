using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AngleSharp;
using AngleSharp.Dom;

namespace Holeshot.Crawler.Commands {
  public static class AngleSharpExtensions {

    public async static Task<IDocument> AsDocument(this AngleSharp.Dom.IElement element) {
      var context = BrowsingContext.New(Configuration.Default);
      return await context.OpenAsync(req => req.Content(element.InnerHtml));

    }

    public static string GetTrackName(this IDocument doc) =>
      doc.QuerySelector("#main_content > h1").FirstChild.TextContent.Trim();

    public static string GetTrackDistrict(this IDocument doc) =>
      doc.QuerySelector("#track_district").TextContent.Split(':')[1].Trim();

    public static Dictionary<string, string> GetContactInfo(this IDocument doc) {

      var contactInfoElements = doc.QuerySelector("div#track_contact ul.no-style").Children;

      var contactInfo = new Dictionary<string, string>();

      contactInfoElements.ForEach(e => {
        var info = e.TextContent.Split(':');
        var val = info[1].Trim();

        if (val.StartsWith("[email")) {
          var node = e.InnerHtml;
          var encEmail = e.Children[1].Attributes[2].Value;
          contactInfo.Add("Encoded Email", encEmail);
        } else {
          contactInfo.Add(info[0].Trim(), info[1].Trim());
        }
      });

      return contactInfo;
    }

    public static string GetTrackLogoUrl(this IDocument doc) {
      // Track logo URL
      var trackLogo = doc.QuerySelector("#track_location > img");
      if (trackLogo != null) {
        return trackLogo.Attributes["src"].Value;
      } else {
        return string.Empty;
      }

    }

    public static Address GetAddress(this IDocument doc, bool trackHasLogo) {

      var childIndex = trackHasLogo ? 3 : 2;

      var locationInfo = doc.QuerySelector($"#track_location > p:nth-child({childIndex})").InnerHtml.Split("<br>");
      var address = new {
        Line1 = string.Empty,
        Line2 = string.Empty,
        City = string.Empty,
        State = string.Empty,
        PostalCode = string.Empty
      };

      if (locationInfo.Count() == 2) { // Assume city, state state zip, country only
        address = new {
          Line1 = string.Empty,
          Line2 = string.Empty,
          City = locationInfo[0].Split(',')[0],
          State = locationInfo[0].Split(", ")[1].Split(' ')[0],
          PostalCode = locationInfo[0].Split(", ")[1].Split(' ')[1]
        };
      } else if (locationInfo.Count() == 3) { // Assume Line1, city state zip, country
        address = new {
          Line1 = locationInfo[0],
          Line2 = string.Empty,
          City = locationInfo[1].Split(',')[0],
          State = locationInfo[1].Split(", ")[1].Split(' ')[0],
          PostalCode = locationInfo[1].Split(", ")[1].Split(' ')[1]
        };

      } else if (locationInfo.Count() == 4) {
        address = new {
          Line1 = locationInfo[0],
          Line2 = locationInfo[1],
          City = locationInfo[2].Split(',')[0],
          State = locationInfo[2].Split(", ")[1].Split(' ')[0],
          PostalCode = locationInfo[2].Split(", ")[1].Split(' ')[1]
        };
      }

      return new Address {
        Line1 = address.Line1,
        Line2 = address.Line2,
        City = address.City,
        State = address.State,
        PostalCode = address.PostalCode
      };
    }

    public static string GetMapLink(this IDocument doc, bool trackHasLogo) =>
        doc.QuerySelector($"#track_location > p:nth-child({(trackHasLogo ? 5 : 4)}) > a")?.Attributes[0].Value;

    public static Tuple<string, string> GetGps(this IDocument doc, string mapLink) {
      var locs = mapLink.Split('?')[1].Split('&')[0].Replace("q=", string.Empty).Split(',');
      return new Tuple<string, string>(locs[0], locs[1]);
    }

    public static string GetWebsite(this IDocument doc, bool trackHasLogo) =>
      doc.QuerySelector($"#track_location > p:nth-child({(trackHasLogo ? 6 : 5)}) > a")?.Attributes[0]?.Value;

    public static string GetDescription(this IDocument doc) {

      var trackContactSection = doc.QuerySelector("#track_contact");
      var descriptionList = new List<string>();

      for (int i = 2; i < trackContactSection.Children.Count(); i++) {
        descriptionList.Add(trackContactSection.Children[i].InnerHtml);
      }
      return string.Join(" ", descriptionList);

    }

    public static string GetTrackId(this IDocument doc, bool trackHasLogo) =>
      doc.QuerySelector($"#track_location > p:nth-child({(trackHasLogo ? 4 : 3)}) > a")?.Attributes[0]?.Value.Split('/')[2];

    public static Dictionary<string, string> GetSocials(this IDocument doc) {

      var socials = new Dictionary<string, string>(); // Name | Url

      var socialsList = doc.QuerySelector("#social-links-wrap > ul");

      socialsList?.Children?.ForEach(li => {
        socials.Add(li.Id, li.Children[0].Attributes[0].Value);
      });

      return socials;

    }

    public static Dictionary<string, string> GetSponsors(this IDocument doc) {
      // Sponsors
      // css: #sponsors-desktop

      var sponsors = new Dictionary<string, string>(); // Name | Url

      var sponsorsList = doc.QuerySelector("#sponsors-desktop");

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

      return sponsors;
    }

    public static Dictionary<string, string> GetCoaches(this IDocument doc, string baseUrl) {
      // Coaches:
      // css: #contact-us > p:nth-child(6)
      var coaches = new Dictionary<string, string>(); // Name | Profile URL

      var coachesList = doc.QuerySelector("#contact-us > p:nth-child(6)");

      coachesList?.Children?.ForEach(el => {
        var name = string.Empty;

        switch (el.TagName) {
          case "STRONG":
            if (el.TextContent != "Coaches:")
              throw new Exception("COACHES ELEMENT WRONG!!");
            break;
          case "A":
            coaches.Add(el.TextContent, $"https://{baseUrl}{el.Attributes["href"].Value}");
            break;
          case "BR":
            break;
          default:
            Console.WriteLine(el.TagName);
            Console.WriteLine(el.InnerHtml);
            break;
        }
      });
      return coaches;

    }

    public static List<string> GetOperators(this IDocument doc) {
      // Track operator
      var trackOperators = new List<string>();

      var trackOperator = doc.QuerySelector("#contact-us > p:nth-child(4)");

      if (trackOperator != null && trackOperator.HasChildNodes) {

        var trackOperatorsSource = trackOperator.InnerHtml.Replace("<strong>Track Operator:</strong>", string.Empty)
                                            .Replace(@"<br />\n<br />", string.Empty)
                                            .Replace("\n", string.Empty)
                                            .Split("<br>")
                                            .Skip(1)
                                            .ToList();

        if (trackOperatorsSource.Count() > 0) {

          trackOperatorsSource.ForEach(op => {
            if (op.Contains("email-protection#")) {

              //Console.WriteLine(op);
              // Example
              // "<a href=\"/cdn-cgi/l/email-protection#5022232a31232a6761656910313f3c7e333f3d\"><span class=\"__cf_email__\" data-cfemail=\"4f3d3c352e3c35787e7a760f2e2023612c2022\">[email&nbsp;protected]</span></a>"

              var cfemail = op.Split("data-cfemail=")[1];
              var end = cfemail.IndexOf("[email") - 3;
              var encEmail = cfemail.Substring(1, end);

              trackOperators.Add($"EncodedEmail:{encEmail}");

            } else {
              trackOperators.Add(op);
            }
          });
        }
      }

      return trackOperators;
    }

    public static List<Event> GetEvents(this IDocument doc, string baseUrl) {

      var eventsElement = doc.QuerySelectorAll("td:has(a)");

      var events = new List<Event>();

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

        var eventsDict = new Dictionary<string, string>();

        eventsList.ForEach(e => {
          if (e != string.Empty) {
            var eventDetails = e.Split(": ");
            if (eventDetails.Count() > 1)
              eventsDict.Add(eventDetails[0], eventDetails[1]);
          }
        });

        events.Add(new Event {
          Name = eventTitle,
          Date = date,
          Url = eventUrl,
          Details = eventsDict
        });
      });

      if (events.Count == 0) {

        Console.WriteLine($"No events.");
      }
      // else {


      // events.ForEach(e => {
      //   Console.WriteLine($"Name: {e.Name}");
      //   Console.WriteLine($"Date: {e.Date.ToLongDateString()}");
      //   Console.WriteLine($"Url: {baseUrl}{e.Url}");
      //   Console.WriteLine($"Details");
      //   e.Details.ForEach(d => Console.WriteLine($"{d.Key}: {d.Value}"));
      // });
      // }

      return events;
    }
  }
}
