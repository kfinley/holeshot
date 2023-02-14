using System.Threading.Tasks;
using AngleSharp;
using AngleSharp.Dom;

namespace Holeshot.Crawler.Commands {
  public static class AngleSharpExtensions {

    public async static Task<IDocument> AsDocument(this AngleSharp.Dom.IElement element) {
      var context = BrowsingContext.New(Configuration.Default);
      return await context.OpenAsync(req => req.Content(element.InnerHtml));

    }

  }
}
