
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
        Region = "SC"
      };

      Sut.Setup<IOptions<Settings>, Settings>(o => o.Value).Returns(new Settings {
        BucketName = "test-bucket"
      });

      Sut.SetupAsync<IMediator, S3ObjectExistsResponse>(m => m.Send(Argument.Is<S3ObjectExistsRequest>(r =>
         r.BucketName == "test-bucket" &&
         r.Key == $"USA-BMX/tracks/search/{Request.Region}"
     ), Argument.IsAny<CancellationToken>()
     )).ReturnsAsync(new S3ObjectExistsResponse {
       Exists = true
     });

      Sut.SetupAsync<IMediator, GetS3ObjectResponse>(m => m.Send(Argument.Is<GetS3ObjectRequest>(r =>
          r.BucketName == "test-bucket" &&
          r.Key == $"USA-BMX/tracks/search/{Request.Region}"
      ), Argument.IsAny<CancellationToken>()
      )).ReturnsAsync(new GetS3ObjectResponse {
        Key = $"USA-BMX/tracks/search/{Request.Region}",
        Contents = System.IO.File.ReadAllText($"../../../test-files/{Request.Region}.html")
      });

      var content = new Dictionary<int, string>
      {
          { 612, System.IO.File.ReadAllText("../../../test-files/site.tracks.612.html") },
          { 701, System.IO.File.ReadAllText("../../../test-files/site.tracks.701.html") },
          { 373, System.IO.File.ReadAllText("../../../test-files/site.tracks.373.html") }
      };

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == "https://www.usabmx.com/site/tracks/612?section_id=1"
      ), Argument.IsAny<CancellationToken>()
      )).ReturnsAsync(new GetPageResponse {
        Contents = content[612]
      });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == "https://www.usabmx.com/site/tracks/701?section_id=1"
      ), Argument.IsAny<CancellationToken>()
      )).ReturnsAsync(new GetPageResponse {
        Contents = content[701]
      });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
        r.Url == "https://www.usabmx.com/site/tracks/373?section_id=1"
      ), Argument.IsAny<CancellationToken>()
      )).ReturnsAsync(new GetPageResponse {
        Contents = content[373]
      });

      Sut.SetupAsync<IMediator, ProcessTrackResponse>(m => m.Send(Argument.Is<ProcessTrackRequest>(r =>
        r.Contents == content[373] &&
        r.BucketName == "test-bucket"
      ), Argument.IsAny<CancellationToken>()
      )).ReturnsAsync(new ProcessTrackResponse {
        Success = true,
        Key = $"USA-BMX/tracks/{373}/trackInfo.json"
      });

      Sut.SetupAsync<IMediator, ProcessTrackResponse>(m => m.Send(Argument.Is<ProcessTrackRequest>(r =>
        r.Contents == content[701] &&
        r.BucketName == "test-bucket"
      ), Argument.IsAny<CancellationToken>()
      )).ReturnsAsync(new ProcessTrackResponse {
        Success = true,
        Key = $"USA-BMX/tracks/{701}/trackInfo.json"
      });

      Sut.SetupAsync<IMediator, ProcessTrackResponse>(m => m.Send(Argument.Is<ProcessTrackRequest>(r =>
        r.Contents == content[612] &&
        r.BucketName == "test-bucket"
      ), Argument.IsAny<CancellationToken>()
      )).ReturnsAsync(new ProcessTrackResponse {
        Success = true,
        Key = $"USA-BMX/tracks/{612}/trackInfo.json"
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
