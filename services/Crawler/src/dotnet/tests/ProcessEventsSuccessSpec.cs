using Machine.Specifications;
using Machine.Specifications.Model;

using FluentAssertions;
using Xunit;
using Moq;
using It = Machine.Specifications.It;
using Argument = Moq.It;

using SUT;
using Holeshot.Crawler.Commands;
using Holeshot.Crawler.Tests.Specs;
using MediatR;
using Holeshot.Aws.Commands;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace Holeshot.Crawler.Tests {
  [Subject("Get Events For Track Success")]
  public class When_ProcessEvents_Requested : SpecBase {


    public When_ProcessEvents_Requested(MSpecFixture fixture)
      : base(fixture) {
      Setup(this, context, of);
    }

    static Sut<ProcessEventsHandler> Sut = new Sut<ProcessEventsHandler, ProcessEventsResponse>();

    static ProcessEventsRequest? Request;
    static ProcessEventsResponse? Result;
    static TrackInfo? TrackInfo = Deserialize<TrackInfo>(System.IO.File.ReadAllText("../../../../../test-files/trackInfo-encoded.json"));

    Establish context = () => {

      Request = new ProcessEventsRequest {
        Track = TrackInfo,
        BucketName = "test-bucket"
      };

      Sut.Setup<IOptions<Settings>, Settings>(o => o.Value).Returns(new Settings {
        BucketName = "test-bucket"
      });

      Sut.Use<JsonSerializerOptions>(JsonOptions);

      // Setup GetPageResponses for each month from current month until the end of the year.

      var year = DateTime.Now.Year;

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == $"https://www.usabmx.com/tracks/1971/events/schedule?mode=calendar&month=3&year={year}#content-wrap" &&
        r.Key == $"sources/USA-BMX/events/1971/events/{year}.3.html"
        ), Argument.IsAny<CancellationToken>()
        )).ReturnsAsync(new GetPageResponse {
          Contents = System.IO.File.ReadAllText($"../../../test-files/events.1971.{year}.3.html"),
          Key = $"sources/USA-BMX/events/1971/events/{year}.3.html"
        });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == $"https://www.usabmx.com/tracks/1971/events/schedule?mode=calendar&month=4&year={year}#content-wrap" &&
        r.Key == $"sources/USA-BMX/events/1971/events/{year}.4.html"
        ), Argument.IsAny<CancellationToken>()
        )).ReturnsAsync(new GetPageResponse {
          Contents = System.IO.File.ReadAllText($"../../../test-files/events.1971.{year}.4.html"),
          Key = $"sources/USA-BMX/events/1971/events/{year}.4.html"
        });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == $"https://www.usabmx.com/tracks/1971/events/schedule?mode=calendar&month=5&year={year}#content-wrap" &&
        r.Key == $"sources/USA-BMX/events/1971/events/{year}.5.html"
        ), Argument.IsAny<CancellationToken>()
        )).ReturnsAsync(new GetPageResponse {
          Contents = System.IO.File.ReadAllText($"../../../test-files/events.1971.{year}.5.html"),
          Key = $"sources/USA-BMX/events/1971/events/{year}.5.html"
        });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == $"https://www.usabmx.com/tracks/1971/events/schedule?mode=calendar&month=6&year={year}#content-wrap" &&
        r.Key == $"sources/USA-BMX/events/1971/events/{year}.6.html"
        ), Argument.IsAny<CancellationToken>()
        )).ReturnsAsync(new GetPageResponse {
          Contents = System.IO.File.ReadAllText($"../../../test-files/events.1971.{year}.6.html"),
          Key = $"sources/USA-BMX/events/1971/events/{year}.6.html"
        });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == $"https://www.usabmx.com/tracks/1971/events/schedule?mode=calendar&month=7&year={year}#content-wrap" &&
        r.Key == $"sources/USA-BMX/events/1971/events/{year}.7.html"
        ), Argument.IsAny<CancellationToken>()
        )).ReturnsAsync(new GetPageResponse {
          Contents = System.IO.File.ReadAllText($"../../../test-files/events.1971.{year}.7.html"),
          Key = $"sources/USA-BMX/events/1971/events/{year}.7.html"
        });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == $"https://www.usabmx.com/tracks/1971/events/schedule?mode=calendar&month=8&year={year}#content-wrap" &&
        r.Key == $"sources/USA-BMX/events/1971/events/{year}.8.html"
        ), Argument.IsAny<CancellationToken>()
        )).ReturnsAsync(new GetPageResponse {
          Contents = System.IO.File.ReadAllText($"../../../test-files/events.1971.{year}.8.html"),
          Key = $"sources/USA-BMX/events/1971/events/{year}.8.html"
        });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == $"https://www.usabmx.com/tracks/1971/events/schedule?mode=calendar&month=9&year={year}#content-wrap" &&
        r.Key == $"sources/USA-BMX/events/1971/events/{year}.9.html"
        ), Argument.IsAny<CancellationToken>()
        )).ReturnsAsync(new GetPageResponse {
          Contents = System.IO.File.ReadAllText($"../../../test-files/events.1971.{year}.9.html"),
          Key = $"sources/USA-BMX/events/1971/events/{year}.9.html"
        });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == $"https://www.usabmx.com/tracks/1971/events/schedule?mode=calendar&month=10&year={year}#content-wrap" &&
        r.Key == $"sources/USA-BMX/events/1971/events/{year}.10.html"
        ), Argument.IsAny<CancellationToken>()
        )).ReturnsAsync(new GetPageResponse {
          Contents = System.IO.File.ReadAllText($"../../../test-files/events.1971.{year}.10.html"),
          Key = $"sources/USA-BMX/events/1971/events/{year}.10.html"
        });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == $"https://www.usabmx.com/tracks/1971/events/schedule?mode=calendar&month=11&year={year}#content-wrap" &&
        r.Key == $"sources/USA-BMX/events/1971/events/{year}.11.html"
        ), Argument.IsAny<CancellationToken>()
        )).ReturnsAsync(new GetPageResponse {
          Contents = System.IO.File.ReadAllText($"../../../test-files/events.1971.{year}.11.html"),
          Key = $"sources/USA-BMX/events/1971/events/{year}.11.html"
        });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == $"https://www.usabmx.com/tracks/1971/events/schedule?mode=calendar&month=12&year={year}#content-wrap" &&
        r.Key == $"sources/USA-BMX/events/1971/events/{year}.12.html"
        ), Argument.IsAny<CancellationToken>()
        )).ReturnsAsync(new GetPageResponse {
          Contents = System.IO.File.ReadAllText($"../../../test-files/events.1971.{year}.12.html"),
          Key = $"sources/USA-BMX/events/1971/events/{year}.12.html"
        });

    };

    Because of = async () =>
      Result = await Sut.Target.Handle(
        Request,
        new CancellationTokenSource().Token
      );

    [Fact]
    public void It_should_return_a_successful_result() => should_return_a_successful_result();
    It should_return_a_successful_result = () => {
      Result.Should().NotBeNull();
      Result?.Success.Should().BeTrue();
    };

  }
}
