using System.Threading;
using System.Threading.Tasks;
using System.IO;

using Amazon.S3;
using Amazon.S3.Model;

using MediatR;
using System;

namespace Holeshot.Aws.Commands {

  public class PutS3ObjectRequest : IRequest<PutS3ObjectResponse> {
    public string BucketName { get; set; }
    public string Key { get; set; }
    public string Content { get; set; }
  }

  public class PutS3ObjectResponse {
    public bool Success { get; set; }

  }

  public class PutS3Object : IRequestHandler<PutS3ObjectRequest, PutS3ObjectResponse> {

    private readonly IAmazonS3 s3Client;

    public PutS3Object(IAmazonS3 s3Client) {
      this.s3Client = s3Client;
    }

    public async Task<PutS3ObjectResponse> Handle(PutS3ObjectRequest request, CancellationToken cancellationToken) {

      try {
        var response = await this.s3Client.PutObjectAsync(new PutObjectRequest {
          BucketName = request.BucketName,
          Key = request.Key,
          ContentBody = request.Content
        });

        return new PutS3ObjectResponse {
          Success = response.HttpStatusCode == System.Net.HttpStatusCode.OK
        };
      } catch (Exception ex) {
        Console.WriteLine(ex);
        throw ex;
      }
    }
  }
}
