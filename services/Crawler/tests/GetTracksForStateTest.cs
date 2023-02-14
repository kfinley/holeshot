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

namespace Holeshot.Crawler.Tests {
  [Subject("Get Tracks For State")]
  public class When_GetTracksForState_Requested : SpecBase {
    public When_GetTracksForState_Requested(MSpecFixture fixture)
      : base(fixture) {
      Setup(this, context, of);
    }

    static Sut<GetTracksForStateHandler> Sut = new Sut<GetTracksForStateHandler, GetTracksForStateResponse>();

    static GetTracksForStateRequest Request;
    static GetTracksForStateResponse Result;

    Establish context = () => {
      var testUserId = Guid.NewGuid();

      Request = new GetTracksForStateRequest {
       State = "SC"
      };

    };

    Because of = async () => Result = await Sut.Target.Handle(Request, new CancellationTokenSource().Token);

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
