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

namespace Holeshot.Crawler.Tests {
  [Subject("Get Tracks For Region Success")]
  public class When_ProcessTrackPage_Requested : SpecBase {
    public When_ProcessTrackPage_Requested(MSpecFixture fixture)
      : base(fixture) {
      Setup(this, context, of);
    }

    static Sut<ProcessTrackPageHandler> Sut = new Sut<ProcessTrackPageHandler, ProcessTrackPageResponse>();

    static ProcessTrackPageRequest Request;
    static ProcessTrackPageResponse Result;

    Establish context = () => {
      Request = new ProcessTrackPageRequest {
        Contents = System.IO.File.ReadAllText("../../../test-files/site.tracks.741.html")
      };

      Sut.Setup<IOptions<Settings>, Settings>(o => o.Value).Returns(new Settings {
        BucketName = "test-bucket"
      });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
       r.Url == "https://www.usabmx.com/tracks/2003"
     ), Argument.IsAny<CancellationToken>()
     )).ReturnsAsync(new GetPageResponse {
       Contents = System.IO.File.ReadAllText("../../../test-files/tracks.2003.html")
     });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == "https://www.usabmx.com/tracks/2003/events/schedule"
      ), Argument.IsAny<CancellationToken>()
      )).ReturnsAsync(new GetPageResponse {
        Contents = System.IO.File.ReadAllText("../../../test-files/tracks.2003.events.html")
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
      Result.Success.Should().BeTrue();
    };

  }
}
