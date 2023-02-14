using Machine.Specifications;
using Xunit;

namespace Holeshot.Crawler.Tests.Specs {

  public abstract class SpecBase : IClassFixture<MSpecFixture> {
    private object lockObject = new object();

    protected MSpecFixture Fixture;

    public SpecBase(MSpecFixture fixture) {
      Fixture = fixture;
    }

    protected void Setup(IClassFixture<MSpecFixture> spec, Establish context, Because of) {
      lock (lockObject)
        Fixture.Setup(spec, context, of);
    }
  }
}
