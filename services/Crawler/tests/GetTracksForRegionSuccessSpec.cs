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
  public class When_GetTracksForRegion_Requested : SpecBase {
    public When_GetTracksForRegion_Requested(MSpecFixture fixture)
      : base(fixture) {
      Setup(this, context, of);
    }

    static Sut<GetTracksForRegionHandler> Sut = new Sut<GetTracksForRegionHandler, GetTracksForRegionResponse>();

    static GetTracksForRegionRequest Request;
    static GetTracksForRegionResponse Result;

    Establish context = () => {
      Request = new GetTracksForRegionRequest {
        Region = "USA"
      };

      Sut.Setup<IOptions<Settings>, Settings>(o => o.Value).Returns(new Settings {
        Bucket = "test-bucket"
      });


      Sut.SetupAsync<IMediator, S3ObjectExistsResponse>(m => m.Send(Argument.Is<S3ObjectExistsRequest>(r =>
         r.Bucket == "test-bucket" &&
         r.Key == $"USA-BMX/tracks/search/{Request.Region}"
     ), Argument.IsAny<CancellationToken>()
     )).ReturnsAsync(new S3ObjectExistsResponse {
       Exists = true
     });

      Sut.SetupAsync<IMediator, GetS3ObjectResponse>(m => m.Send(Argument.Is<GetS3ObjectRequest>(r =>
          r.Bucket == "test-bucket" &&
          r.Key == $"USA-BMX/tracks/search/{Request.Region}"
      ), Argument.IsAny<CancellationToken>()
      )).ReturnsAsync(new GetS3ObjectResponse {
        Key = "??????????????????",
        // /workspace/services/Crawler/tests/bin/Debug/net6.0/test-files/USA.html
        Contents = System.IO.File.ReadAllText($"../../../test-files/{Request.Region}.html")
      });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == "https://www.usabmx.com/site/tracks/741?section_id=1"
      ), Argument.IsAny<CancellationToken>()
      )).ReturnsAsync(new GetPageResponse {
        Contents = System.IO.File.ReadAllText("../../../test-files/site.tracks.741.html")
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

    [Fact]
    public void It_should_publish_message() => should_publish_message();
    It should_publish_message = () => {
      Sut.Verify<IMediator>(p => p.Publish(Argument.IsAny<PublishMessageRequest>(), Argument.IsAny<CancellationToken>()), Times.Once());
    };

  }
}
