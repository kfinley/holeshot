using System.IO;
using System.Threading;
using System.Threading.Tasks;

using MediatR;
using Amazon.S3;
using Amazon.S3.Transfer;
using System;

namespace Holeshot.Aws.Commands {
  public class SaveStreamToS3Request : IRequest<SaveStreamToS3Response> {
    public string BucketName { get; set; }
    public string Key { get; set; }
    public Stream Stream { get; set; }
  }

  public class SaveStreamToS3Response {
    public string UploadId { get; set; }
    public bool IsSuccess { get; set; }
  }

  public class SaveStreamToS3 : IRequestHandler<SaveStreamToS3Request, SaveStreamToS3Response> {

    private readonly IAmazonS3 s3Client;

    private readonly IFileUploader fileUploader;

    public SaveStreamToS3(IAmazonS3 s3Client, IFileUploader fileUploader) {
      this.s3Client = s3Client;
      this.fileUploader = fileUploader;
    }

    public async Task<SaveStreamToS3Response> Handle(SaveStreamToS3Request request, CancellationToken cancellationToken) {

      var uploadId = await this.fileUploader.UploadFileAsync(request.Stream, request.BucketName, request.Key, null);

      // using (var transferUtility = new TransferUtility(s3Client)) {
      //   try {
      //     await transferUtility.UploadAsync(request.Stream, request.BucketName, request.Key);
      //   } catch (Exception ex) {
      //     Console.WriteLine($"Exception in SaveStreamToS3. {ex}");
      //     Console.WriteLine(ex.Message);
      //     Console.WriteLine(ex.InnerException?.Message);
      //     throw ex;
      //   }
      // }

      return new SaveStreamToS3Response {
        UploadId = uploadId,
        IsSuccess = true
      };
    }

  }

}
