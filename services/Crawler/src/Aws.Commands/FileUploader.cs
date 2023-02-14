using Amazon.S3;
using Amazon.S3.Model;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Buffers;
using Microsoft.Extensions.Logging;

namespace Holeshot.Aws.Commands {
  public interface IFileUploader {
    Task<string> UploadFileAsync(Stream inputStream, string bucket, string key, Action<UploadEvent> callback);
  }

  public class FileUploader : IFileUploader {

    IAmazonS3 s3Client;
    ILogger<FileUploader> logger;

    const int PART_SIZE = 6 * 1024 * 1024;
    const int READ_BUFFER_SIZE = 20000;


    public FileUploader(ILogger<FileUploader> logger, IAmazonS3 s3Client) {
      this.logger = logger;
      this.s3Client = s3Client;
    }

    public async Task<string> UploadFileAsync(Stream inputStream, string bucket, string key, Action<UploadEvent> callback) {

      this.logger?.LogInformation($"Start uploading to {key}");

      var initiateResponse = await s3Client.InitiateMultipartUploadAsync(new InitiateMultipartUploadRequest {
        BucketName = bucket,
        Key = key
      });

      this.logger?.LogInformation($"Initiated multipart upload with id {initiateResponse.UploadId}");

      try {

        var partETags = new List<PartETag>();
        var readBuffer = ArrayPool<byte>.Shared.Rent(READ_BUFFER_SIZE);
        var partBuffer = ArrayPool<byte>.Shared.Rent(PART_SIZE + (READ_BUFFER_SIZE * 3));

        var callbackEvent = new UploadEvent();
        var nextUploadBuffer = new MemoryStream(partBuffer);

        try {

          int partNumber = 1;
          int readCount;

          while ((readCount = (await inputStream.ReadAsync(readBuffer, 0, readBuffer.Length))) != 0) {
            callbackEvent.UploadBytes += readCount;
            callback?.Invoke(callbackEvent);

            await nextUploadBuffer.WriteAsync(readBuffer, 0, readCount);

            if (PART_SIZE < nextUploadBuffer.Position) {
              var isLastPart = readCount == READ_BUFFER_SIZE;
              var partSize = nextUploadBuffer.Position;
              nextUploadBuffer.Position = 0;
              var partResponse = await s3Client.UploadPartAsync(new UploadPartRequest {
                BucketName = bucket,
                Key = key,
                UploadId = initiateResponse.UploadId,
                InputStream = nextUploadBuffer,
                PartSize = partSize,
                PartNumber = partNumber,
                IsLastPart = isLastPart
              });

              this.logger?.LogInformation($"Uploaded part {partNumber}. (Last part = {isLastPart}, Part size = {partSize}, Upload Id: {initiateResponse.UploadId}");

              partETags.Add(new PartETag { PartNumber = partResponse.PartNumber, ETag = partResponse.ETag });
              partNumber++;
              nextUploadBuffer = new MemoryStream(partBuffer);

              callbackEvent.UploadParts++;
              callback?.Invoke(callbackEvent);
            }
          }


          if (nextUploadBuffer.Position != 0) {

            var partSize = nextUploadBuffer.Position;

            nextUploadBuffer.Position = 0;

            var partResponse = await s3Client.UploadPartAsync(new UploadPartRequest {
              BucketName = bucket,
              Key = key,
              UploadId = initiateResponse.UploadId,
              InputStream = nextUploadBuffer,
              PartSize = partSize,
              PartNumber = partNumber,
              IsLastPart = true
            });

            this.logger?.LogInformation($"Uploaded final part. (Part size = {partSize}, Upload Id: {initiateResponse.UploadId})");

            partETags.Add(new PartETag { PartNumber = partResponse.PartNumber, ETag = partResponse.ETag });

            callbackEvent.UploadParts++;
            callback?.Invoke(callbackEvent);
          }
        } finally {
          ArrayPool<byte>.Shared.Return(partBuffer);
          ArrayPool<byte>.Shared.Return(readBuffer);
        }

        await s3Client.CompleteMultipartUploadAsync(new CompleteMultipartUploadRequest {
          BucketName = bucket,
          Key = key,
          UploadId = initiateResponse.UploadId,
          PartETags = partETags
        });

        this.logger?.LogInformation($"Completed multipart upload. (Part count: {partETags.Count}, Upload Id: {initiateResponse.UploadId})");

      } catch (Exception ex) {

        this.logger?.LogError($"Error uploading to S3 with error: {ex.Message}");

        throw;
      }

      return initiateResponse.UploadId;

    }
  }

  public class UploadEvent {
    public long UploadBytes { get; set; }
    public int UploadParts { get; set; }
  }
}
