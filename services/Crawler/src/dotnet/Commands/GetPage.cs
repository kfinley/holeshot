
using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Options;

using MediatR;

using Holeshot.Aws.Commands;

namespace Holeshot.Crawler.Commands {

  public class  GetPageRequest : IRequest<GetPageResponse> {
    public bool UseProxy { get; set; } = true;
    public string RootFolder = "";
    public string Key = "";
    public string Url { get; set; }
  }

  public class GetPageResponse {
    public string Key { get; set; }
    public string Contents { get; set; }
  }

  public class GetPageHandler : Crawly, IRequestHandler<GetPageRequest, GetPageResponse> {

    public GetPageHandler(IMediator mediator, IOptions<Settings> settings) : base(mediator, settings.Value) { }

    public async Task<GetPageResponse> Handle(GetPageRequest request, CancellationToken cancellationToken) {

      if (request.Key == string.Empty) {
        throw new Exception("Error in GetPage.cs: Key was empty.");
      }

      // Console.WriteLine($"Key: {request.Key}");
      // Console.WriteLine($"BucketName: {this.settings.BucketName}");

      var fileMeta = await base.mediator.Send(new S3ObjectExistsRequest {
        BucketName = this.settings.BucketName,
        Key = request.Key
      });

      if (fileMeta == null || !fileMeta.Exists) {
        var response = await this.Send(new DownloadToS3Request {
          Url = request.Url,
          Key = request.Key,
          BucketName = this.settings.BucketName
        });
      }

      var file =  await this.Send(new GetS3ObjectRequest {
        Key = request.Key,
        BucketName = this.settings.BucketName
      });

      return new GetPageResponse {
        Key = request.Key,
        Contents = file.Contents
      };
    }
  }
}
