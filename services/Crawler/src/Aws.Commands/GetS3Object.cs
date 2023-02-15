using System.Threading;
using System.Threading.Tasks;
using System.IO;

using Amazon.S3;
using Amazon.S3.Model;

using MediatR;

namespace Holeshot.Aws.Commands {

  public class GetS3ObjectRequest : IRequest<GetS3ObjectResponse> {
    public string BucketName { get; set; }
    public string Key { get; set; }
  }

  public class GetS3ObjectResponse {
    public string Key { get; set; }
    public string Contents { get; set; }
  }

  public class GetS3Object : IRequestHandler<GetS3ObjectRequest, GetS3ObjectResponse> {

    private readonly IAmazonS3 s3Client;

    public GetS3Object(IAmazonS3 s3Client) {
      this.s3Client = s3Client;
    }

    public async Task<GetS3ObjectResponse> Handle(GetS3ObjectRequest request, CancellationToken cancellationToken) {


      using (var response = await this.s3Client.GetObjectAsync(new GetObjectRequest {
        BucketName = request.BucketName,
        Key = request.Key
      }))
      using (var stream = response.ResponseStream)
      using (var reader = new StreamReader(stream)) {

        return new GetS3ObjectResponse {
          Key = request.Key,
          Contents = reader.ReadToEnd()
        };
      }
    }
  }
}
