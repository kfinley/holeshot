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
  [Subject("Get Tracks For Region Success")]
  public class When_ProcessTrack_Requested : SpecBase {
    public When_ProcessTrack_Requested(MSpecFixture fixture)
      : base(fixture) {
      Setup(this, context, of);
    }

    static Sut<ProcessTrackHandler> Sut = new Sut<ProcessTrackHandler, ProcessTrackResponse>();

    static ProcessTrackRequest? Request;
    static ProcessTrackResponse? Result;

    Establish context = () => {
      Request = new ProcessTrackRequest {
        Contents = System.IO.File.ReadAllText("../../../test-files/site.tracks.701.html"),
        BucketName = "test-bucket"
      };

      Sut.Setup<IOptions<Settings>, Settings>(o => o.Value).Returns(new Settings {
        BucketName = "test-bucket"
      });

      Sut.Use<JsonSerializerOptions>(new JsonSerializerOptions() {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
        // DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        MaxDepth = 10,
        // ReferenceHandler = ReferenceHandler.IgnoreCycles,
        WriteIndented = true
      });

      Sut.SetupAsync<IMediator, S3ObjectExistsResponse>(m => m.Send(Argument.Is<S3ObjectExistsRequest>(r =>
        r.BucketName == "test-bucket" &&
        r.Key == "sources/USA-BMX/tracks/1971/page.html"
      ), Argument.IsAny<CancellationToken>()
      )).ReturnsAsync(new S3ObjectExistsResponse {
        Exists = true
      });

      // Sut.SetupAsync<IMediator, S3ObjectExistsResponse>(m => m.Send(Argument.Is<S3ObjectExistsRequest>(r =>
      //   r.BucketName == "test-bucket" &&
      //   r.Key == "USA-BMX/tracks/1971/events.2"
      // ), Argument.IsAny<CancellationToken>()
      // )).ReturnsAsync(new S3ObjectExistsResponse {
      //   Exists = true
      // });

      Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
       r.Url == "https://www.usabmx.com/tracks/1971" &&
       r.Key == "sources/USA-BMX/tracks/1971/page.html"
     ), Argument.IsAny<CancellationToken>()
     )).ReturnsAsync(new GetPageResponse {
       Contents = System.IO.File.ReadAllText("../../../test-files/tracks.1971.html"),
       Key = "sources/USA-BMX/tracks/1971/page.html"
     });

      // Sut.SetupAsync<IMediator, GetPageResponse>(m => m.Send(Argument.Is<GetPageRequest>(r =>
      //   r.Url == "https://www.usabmx.com/tracks/1971/events/schedule" &&
      //   r.Key == "USA-BMX/tracks/1971/events.2"
      // ), Argument.IsAny<CancellationToken>()
      // )).ReturnsAsync(new GetPageResponse {
      //   Contents = System.IO.File.ReadAllText("../../../test-files/tracks.1971.events.2.html"),
      //   Key = "USA-BMX/tracks/1971/events.2"
      // });

      Sut.SetupAsync<IMediator, PutS3ObjectResponse>(m => m.Send(Argument.IsAny<PutS3ObjectRequest>(), Argument.IsAny<CancellationToken>()))
        .ReturnsAsync(new PutS3ObjectResponse {
          Success = true
        })
        .Callback((IRequest<PutS3ObjectResponse> request, CancellationToken token) => {
          System.IO.File.WriteAllText("../../../../../test-files/trackInfo-encoded.json", ((PutS3ObjectRequest)request).Content);
          // Console.WriteLine(((PutS3ObjectRequest)request).Content);
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
