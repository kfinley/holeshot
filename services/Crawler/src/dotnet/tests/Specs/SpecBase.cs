using System.Text.Json;
using Machine.Specifications;
using Xunit;

namespace Holeshot.Crawler.Tests.Specs {

  public abstract class SpecBase : IClassFixture<MSpecFixture> {
    private object lockObject = new object();

    protected MSpecFixture Fixture;
    public static JsonSerializerOptions JsonOptions = new JsonSerializerOptions() {
      PropertyNameCaseInsensitive = true,
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
      DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
      MaxDepth = 10,
      WriteIndented = true
    };

    public SpecBase(MSpecFixture fixture) {
      Fixture = fixture;

    }

    protected void Setup(IClassFixture<MSpecFixture> spec, Establish context, Because of) {
      lock (lockObject)
        Fixture.Setup(spec, context, of);
    }

    public static T Deserialize<T>(string o) {
      return JsonSerializer.Deserialize<T>(o, JsonOptions);
    }

  }
}
