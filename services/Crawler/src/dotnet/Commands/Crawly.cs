using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Net.Http.Headers;
using System.Net;
using System.Linq;
using System.Diagnostics;
using MediatR;
using System.Threading;
using System.Text.Json;

namespace Holeshot.Crawler.Commands {

  public abstract class Crawly {

    protected IList<Task> Tasks;
    // protected readonly string ExePath = new FileInfo(Assembly.GetEntryAssembly().Location).Directory.ToString();
    // protected readonly string ExePath = "/Users/rkf/projects/Crawly";
    protected string AccessToken = "";

    protected readonly IMediator mediator;

    protected readonly Settings settings;

    private readonly JsonSerializerOptions jsonOptions;
    public Crawly(IMediator mediator, Settings settings, JsonSerializerOptions jsonOptions = null) {
      this.mediator = mediator;
      this.settings = settings;
      if (jsonOptions is null) {
        this.jsonOptions = JsonSerializerOptions.Default;
      } else {
        this.jsonOptions = jsonOptions;
      }
    }

    //https://freeproxyupdate.com/united-states-us
    //https://www.us-proxy.org
    //https://hidemy.name/en/proxy-list/?country=US&type=s#list
    protected string proxy = "193.233.202.222:3128";

    protected string proxyUri {
      get { return $"http://{this.proxy}"; }
    }

    //TODO: write a helper method that automatically picks a proxy for us

    internal string GetTitleTag(string content) {
      try {
        var title = Regex.Match(content, "<title>(.*?)</title>").Groups[1].Value;
        if (title == string.Empty) {
          var titleFrag = content.Substring(content.IndexOf("<title>"));
          titleFrag = titleFrag.Substring(0, titleFrag.IndexOf("</title"));
          return titleFrag.Replace("<title>", string.Empty).TrimStart().TrimEnd();
        }
        return title;
      } catch (Exception) {
        return Guid.NewGuid().ToString();
      }
    }

    protected async Task<T> RunThen<T>(Func<Task<T>> func, Func<T, Task> next) {
      var result = await func();
      await next(result);
      return result;
    }

    protected async Task<List<Tuple<string, string>>> GetPages(IEnumerable<string> urls, Func<string, string> createKey, Func<Tuple<string, string>, Task<bool>> func,
                                                                string basePath = "") {

      var pages = new List<Tuple<string, string>>();
      var tasks = new List<Task<Tuple<string, string>>>();

      foreach (var url in urls) {

        //await Task.Delay(Numbers.RandomBetween(2000, 5000)); // Suckfest... Force wait to try to get around rate limiter

#if DEBUG
        if (tasks.Count > 0) {       // Disable threads for debugging
#else
        if (tasks.Count >= 9) {      // Limit to 10 active threads for production
#endif
          pages.Add(await tasks[0]);
          tasks.RemoveAt(0);
        }

        var uri = basePath == string.Empty ? url : $"{basePath}{url}";

        // Console.WriteLine($"Processing {uri}");

        tasks.Add(RunThen(
          async () => {
            var key = createKey(uri); // same here...
            var response = await this.mediator.Send(new GetPageRequest {
              Url = uri,  // bad names but we want to pass the full uri as the URL
              Key = key
            });
            return new Tuple<string, string>(response.Key, response.Contents);
          },
          (result) => func(result)));
      }

      //TODO: Refactor. Drains the queue when 10 tasks reached
      await Task.WhenAll(tasks);

      foreach (var t in tasks) {
        //Console.WriteLine($"GetPage result: {await t}");
        pages.Add(await t);
      }

      return pages;
    }

    protected async Task<bool> ProcessBatch(int start, int batchSize, int batch, int batches, Func<int, Task<bool>> func) {

      //Console.WriteLine($"Processing Batch {batch} of {batches}. Start: {start}");

      try {
        var tasks = new List<Task<bool>>();

        for (int i = start; i < start + batchSize; i++) {
          tasks.Add(Task.Factory.StartNew(() => func(i).Result));
        }

        await Task.WhenAll(tasks);

      } catch (Exception ex) {
        var foo = ex.Message;
        throw;
      }

      return true;
    }

    private async Task<bool> ProcessInBatches2(int startNum, int batchSize, int batches, Func<int, Task<bool>> func) {

      var totalRecords = batches * batchSize;

      Console.WriteLine($"Total Records: {totalRecords}");

      var batch = 1;

      var tasks = new List<Task<bool>>();

      for (int start = startNum; start < start + totalRecords; start += batchSize) {

        //var processingTasks = new List<Task<bool>>();

        await this.ProcessBatch(start, batchSize, batch, batches, func);

        //processingTasks.Add(ProcessBatch(start, batchSize, batch, batches, func));

        await Task.Delay(50);

        // Move to the next batch and kick off another thread to process batch async
        batch++;
        // start += batchSize;

        // if (start < totalRecords) {
        //     var t2start = start;
        //     var t2batch = batch;
        //     processingTasks.Add(Task.Factory.StartNew(() => ProcessBatch(start, batchSize, batch, batches, func).Result));

        //     // processingTasks.Add(ProcessBatch(start, batchSize, batch, batches, func));

        //     batch++;
        // }

      }

      await Task.WhenAll(tasks);

      Console.WriteLine($"Finished Processing: Start: {startNum}");

      return true;
    }

    protected async Task<bool> ProcessInBatches(int start, int batchSize, int batches, Func<int, Task<bool>> func) {

      var totalRecords = batches * batchSize;

      Console.WriteLine($"Total Records: {totalRecords}");

      var batch = 1;

      var tasks = new List<Task<bool>>();

      for (int i = start; i < start + totalRecords; i++) {

        var processingTasks = new List<Task<bool>>();

        var t1Batch = batch;

        processingTasks.Add(Task.Factory.StartNew(() => ProcessBatch(start, batchSize, batch, batches, func).Result));

        //processingTasks.Add(ProcessBatch(start, batchSize, batch, batches, func));

        await Task.Delay(50);

        // Move to the next batch and kick off another thread to process batch async
        batch++;
        start += batchSize;

        if (start < totalRecords) {
          var t2start = start;
          var t2batch = batch;
          processingTasks.Add(Task.Factory.StartNew(() => ProcessBatch(start, batchSize, batch, batches, func).Result));

          // processingTasks.Add(ProcessBatch(start, batchSize, batch, batches, func));

          batch++;
        }

        await Task.WhenAll(processingTasks);

      }

      await Task.WhenAll(tasks);

      Console.WriteLine($"Finished Processing: Start: {start}");

      return true;
    }

    protected void AddTask(Task task) {
      if (Tasks == null) {
        Tasks = new List<Task>();
      }

      Tasks.Add(task);
    }

    protected HttpClient CreateClient(bool useProxy, string mediaType = "text/html,application/xhtml+xml,image/avif,image/webp") {

      try {

        var client = CreateHttpClient(useProxy);
        client.Timeout = new TimeSpan(0, 0, 10, 0);

        mediaType.Split(',').ForEach(t => client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(t)));

        return client;
      } catch (Exception ex) {
        var foo = ex.Message;
        throw;
      }
    }

    private void CheckProxyIp() {
      using (var client = CreateHttpClient()) {
        var content = client.GetAsync($"http://www.whatsmyip.org/").Result.Content.ReadAsStringAsync().Result;
        System.Console.WriteLine(Regex.Matches(content, "(<h1>Your IP Address is <span id=\"ip\">)(.*)(<\\/h1>)")[0]);
      }
    }

    private HttpClient CreateHttpClient(bool useProxy = true) {

      if (useProxy) {
        var httpClientHandler = new HttpClientHandler {
          Proxy = new WebProxy($"{this.proxyUri}", false),
          UseProxy = true
        };

        var client = new HttpClient(httpClientHandler);

        client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.9999.0 Safari/537.36");

        return client;
      } else {
        return new HttpClient();
      }
    }

    protected int? GetSliderValue(string name, string content) {

      try {
        var sliderFrag = content.Substring(content.IndexOf($"<h4>{name}</h4>"));
        sliderFrag = sliderFrag.Substring(sliderFrag.IndexOf("data-slider-value=") + 19);
        return int.Parse(sliderFrag.Substring(0, sliderFrag.IndexOf("'")));
      } catch (Exception) {
        return null;
      }
    }

    internal async Task WhenAllTasksDone() {
      await Task.WhenAll(Tasks);
    }

    protected string GetPSection(string content, string heading) {

      try {

        if (content.IndexOf(heading) == -1)
          return string.Empty;

        var frag = content.Substring(content.IndexOf(heading) + heading.Length);
        frag = frag.Substring(0, frag.IndexOf("<h"));
        if (frag.IndexOf("<p>") == -1)
          return string.Empty;
        frag = frag.Substring(frag.IndexOf("<p>") + 3);
        return frag.Substring(0, frag.IndexOf("</p>")).Replace("\n", string.Empty);
      } catch (Exception) {
        return string.Empty;
      }
    }

    protected string GetSpanSection(string previousTagFrag, string content) {

      try {
        if (content.IndexOf(previousTagFrag) == -1)
          return string.Empty;
        var frag = content.Substring(content.IndexOf(previousTagFrag));
        frag = frag.Substring(frag.IndexOf('>') + 1);
        frag = frag.Substring(0, frag.IndexOf("<h"));
        if (frag.IndexOf("<span") == -1)
          return string.Empty;
        frag = frag.Substring(frag.IndexOf("<span"));
        frag = frag.Substring(frag.IndexOf('>') + 1);
        return frag.Substring(0, frag.IndexOf("</span>")).Replace("\n", string.Empty);
      } catch (Exception) {
        return string.Empty;
      }

    }

    protected string GetHValue(string headingFrag, string content) {

      try {
        if (content.IndexOf(headingFrag) < 0)
          return string.Empty;

        var frag = content.Substring(content.IndexOf(headingFrag) + headingFrag.Length);
        frag = frag.Substring(frag.IndexOf('>') + 1);
        return frag.Substring(0, frag.IndexOf("</")).Replace("\n", string.Empty);
      } catch (Exception) {
        return string.Empty;
      }
    }


    protected IEnumerable<string> GetUniqueHrefUrls(string urlFrag, string content) {
      var urls = this.GetHrefUrls(urlFrag, content);

      return urls.Distinct();
    }
    protected IEnumerable<string> GetHrefUrls(string urlFrag, string content, bool unique = false) {
      string hrefPattern = @$"href\s*=\s*(?:[""'](?<1>[^""']*)[""']|(?<1>[^>\s]+))";

      var match = Regex.Match(content, hrefPattern,
                                 RegexOptions.IgnoreCase | RegexOptions.Compiled,
                                 TimeSpan.FromSeconds(1));

      while (match.Success) {
        if (match.Value.ToLower().Contains(urlFrag.ToLower())) {
          yield return match.Groups[1].ToString();
        }
        match = match.NextMatch();
      }
    }

    protected IEnumerable<string> GetHrefs(string urlFrag, string content) {

      var regex = new Regex("(?s)<a [^>]*?>(?<text>.*?)</a>", RegexOptions.IgnoreCase);

      for (var match = regex.Match(content); match.Success; match = match.NextMatch()) {

        if (match.Value.ToLower().Contains(urlFrag.ToLower())) {
          yield return match.Value;
        }
      }
    }

    // internal async Task<string> SavePageAndReturnContent(string root, string fileName, string url, bool useExistingFileIfPresent = true, bool useProxy = true) {

    //   var content = string.Empty;
    //   var contentType = string.Empty;
    //   var file = $"{ExePath}/Results/{root}/{fileName}.html";

    //   if (File.Exists(file) && useExistingFileIfPresent) {
    //     Console.log($"Using existing file {file}");
    //     content = File.ReadAllText(file);
    //   } else {

    //     using (var client = this.CreateClient(useProxy))
    //       try {
    //         using (var response = await client.GetAsync(url)) {
    //           if (response.StatusCode == HttpStatusCode.MovedPermanently
    //               || response.StatusCode == HttpStatusCode.Moved) {
    //             Console.WriteLine($"Moved || MovedPermanently");
    //             return content;
    //           } else if (response.StatusCode == HttpStatusCode.NotFound
    //                 || response.StatusCode == HttpStatusCode.Forbidden) {
    //             Console.WriteLine($"{response.StatusCode}");
    //             return content;
    //           }

    //           contentType = response.Content.Headers.ContentType?.CharSet;

    //           content = await response.Content.ReadAsStringAsync();
    //         }

    //       } catch (Exception ex) when (ex.Message == "The character set provided in ContentType is invalid. Cannot read content as string using an invalid character set.") {

    //         //TODO: make a command for handling exceptions...
    //         Console.WriteLine(ex.Message);
    //         Console.WriteLine(ex.StackTrace);

    //         if (ex.InnerException != null) {
    //           Console.WriteLine("Inner Exception");
    //           Console.WriteLine(ex.InnerException.Message);
    //           Console.WriteLine(ex.InnerException.StackTrace);
    //         }

    //         var response = await client.GetByteArrayAsync(url);

    //         if (contentType == "ISO-8859-15") {
    //           contentType = "ISO-8859-1";
    //         }

    //         content = Encoding
    //             .GetEncoding(contentType)
    //             .GetString(response, 0, response.Length);
    //       } catch (Exception ex) {
    //         Console.WriteLine(ex.Message);
    //         Console.WriteLine(ex.StackTrace);
    //       }

    //     if (content != string.Empty)
    //       await File.WriteAllTextAsync(file, $"<!-- {url} -->\n{content}");
    //   }

    //   return content;
    // }

    protected string RunShellCmd(string cmd, string args) {
      var start = new ProcessStartInfo();

      start.FileName = "/usr/local/opt/python/libexec/bin/python";
      start.Arguments = string.Format("{0} {1}", cmd, args);
      start.UseShellExecute = false;
      start.RedirectStandardOutput = true;
      using (Process process = Process.Start(start)) {
        using (StreamReader reader = process.StandardOutput) {
          string result = reader.ReadToEnd();
          System.Console.Write(result);
          return result;
        }
      }
    }

    public Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default) {
      return this.mediator.Send(request, cancellationToken);
    }

    public Task<object> Send(object request, CancellationToken cancellationToken = default) {
      return this.mediator.Send(request, cancellationToken);
    }

    public Task Publish(object notification, CancellationToken cancellationToken = default) {
      return this.mediator.Publish(notification, cancellationToken);
    }

    public Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default) where TNotification : INotification {
      return this.mediator.Publish(notification, cancellationToken);
    }

    protected string Serialize<T>(T o) {
      return JsonSerializer.Serialize(o, this.jsonOptions);
    }
  }
}
