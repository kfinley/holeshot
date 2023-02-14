using System.Collections.Generic;

namespace Holeshot.Crawler.Commands {
  public static class ListLike {
    public static List<T> This<T>(T example)
      where T : class
        => new List<T>();
  }
}
