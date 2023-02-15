using MediatR;
using System;
using Amazon.S3;

using System.IO;
using System.Net;
using System.Threading.Tasks;
using System.Threading;

namespace Holeshot.Aws.Commands {

  public class DownloadToS3Request : IRequest<DownloadToS3Response> {
    public string Url { get; set; }
    public string Bucket { get; set; }
    public string Key { get; set; }
    public string ContentType { get; set; }
  }

  public class DownloadToS3Response {
    public string UploadId { get; set; }
    public bool IsSuccess { get; set; }
  }

  public class DownloadToS3 : IRequestHandler<DownloadToS3Request, DownloadToS3Response> {

    private readonly IMediator mediator;
    private readonly IAmazonS3 s3Client;

    public DownloadToS3(IMediator mediator, IAmazonS3 s3Client) {
      this.mediator = mediator;
      this.s3Client = s3Client;
    }

    public async Task<DownloadToS3Response> Handle(DownloadToS3Request request, CancellationToken cancellationToken) {

      using (var client = new WebClient()) {

        try {

          var fileBytes = client.DownloadData(new Uri(request.Url));
          Console.WriteLine(fileBytes);

          using (var stream = new MemoryStream(fileBytes)) {
            Console.WriteLine("created stream");

            var response = await this.mediator.Send(new SaveStreamToS3Request {
              BucketName = request.Bucket,
              Key = request.Key,
              Stream = stream,
            });

            return new DownloadToS3Response {
              IsSuccess = response.IsSuccess,
              UploadId = response.UploadId
            };
          }
        } catch (Exception ex) {
          throw new Exception($"URL: {request.Url}  Bucket: {request.Bucket} Key: {request.Key} Message: {ex.Message}");
        }
      }
    }

  }
}
