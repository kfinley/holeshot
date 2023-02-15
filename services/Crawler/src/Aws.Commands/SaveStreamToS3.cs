using System.IO;
using System.Threading;
using System.Threading.Tasks;

using MediatR;
using Amazon.S3;
using Amazon.S3.Transfer;
using System;

namespace Holeshot.Aws.Commands {
  public class SaveStreamToS3Request : IRequest<SaveStreamToS3Response> {
    public string Bucket { get; set; }
    public string Key { get; set; }
    public Stream Stream { get; set; }
  }

  public class SaveStreamToS3Response {
    public string UploadId { get; set; }
    public bool IsSuccess { get; set; }
  }

  public class SaveStreamToS3 : IRequestHandler<SaveStreamToS3Request, SaveStreamToS3Response> {

    private readonly IAmazonS3 s3Client;

    public SaveStreamToS3(IAmazonS3 s3Client) {
      this.s3Client = s3Client;
    }

    public async Task<SaveStreamToS3Response> Handle(SaveStreamToS3Request request, CancellationToken cancellationToken) {

      Console.WriteLine($"SaveStreamToS3 Bucket: {request.Bucket}");

      var fileUploader = new FileUploader(null, this.s3Client);

      var uploadId = await fileUploader.UploadFileAsync(request.Stream, request.Bucket, request.Key, null);

      using (var transferUtility = new TransferUtility(s3Client)) {
        try {
          await transferUtility.UploadAsync(request.Stream, request.Bucket, request.Key);
        } catch (Exception ex) {
          Console.WriteLine($"Exception in SaveStreamToS3. {ex}");
          Console.WriteLine(ex.Message);
          Console.WriteLine(ex.InnerException?.Message);
          throw ex;
        }
      }

      return new SaveStreamToS3Response {
        UploadId = uploadId,
        IsSuccess = true
      };
    }

  }

}
