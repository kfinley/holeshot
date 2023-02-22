using System;
using System.Collections.Generic;

public class Address {
  public string Line1 { get; set; }
  public string Line2 { get; set; }
  public string City { get; set; }
  public string State { get; set; }
  public string PostalCode { get; set; }
}

public class Event {
  public string Name { get; set; }
  public DateTime Date { get; set; }
  public string Url { get; set; }
  public Dictionary<string, string> Details { get; set; }
}

public class Coach {
  public string Name { get; set; }
  public string ProfileUrl { get; set; }
}

public class Sponsor {
  public string Name { get; set; }
  public string Link { get; set; }
}

