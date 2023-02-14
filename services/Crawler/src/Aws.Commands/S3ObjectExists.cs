using System.Threading;
using System.Threading.Tasks;
using System.IO;

using Amazon.S3;
using Amazon.S3.Model;

using MediatR;
using System;

namespace Holeshot.Aws.Commands {

  public class S3ObjectExistsRequest : IRequest<S3ObjectExistsResponse> {
    public string Bucket { get; set; }
    public string Key { get; set; }
  }

  public class S3ObjectExistsResponse {
    public bool Exists { get; set; }
    public GetObjectMetadataResponse Metadata { get; set; }
  }

  public class S3ObjectExists : IRequestHandler<S3ObjectExistsRequest, S3ObjectExistsResponse> {

    private readonly IAmazonS3 s3Client;

    public S3ObjectExists(IAmazonS3 s3Client) {
      this.s3Client = s3Client;
    }

    public async Task<S3ObjectExistsResponse> Handle(S3ObjectExistsRequest request, CancellationToken cancellationToken) {

      try {
        var response = await this.s3Client.GetObjectMetadataAsync(new GetObjectMetadataRequest {
          BucketName = request.Bucket,
          Key = request.Key
        });

        return new S3ObjectExistsResponse {
          Metadata = response,
          Exists = true
        };

      } catch (AmazonS3Exception ex) {
        Console.WriteLine($"AmazonS3Exception: {ex.Message}");
        return new S3ObjectExistsResponse {
          Exists = false
        };
      }

    }
  }
}
