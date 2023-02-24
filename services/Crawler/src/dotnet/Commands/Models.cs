using System;
using System.Collections.Generic;

public class Address {
  public string Line1 { get; set; }
  public string Line2 { get; set; }
  public string City { get; set; }
  public string State { get; set; }
  public string PostalCode { get; set; }
}

public class Location {
  public Address Address { get; set; }
  public string MapLink { get; set; }
  public GPS GPS { get; set; }
}

public class GPS {
  public string Lat { get; set; }
  public string Long { get; set; }
}

public class Event {
  public string Name { get; set; }
  public DateTime Date { get; set; }
  public string Url { get; set; }
  public Dictionary<string, string> Details { get; set; }
}

public class NamedLink {
  public string Name { get; set; }
  public string Link { get; set; }
}

public class TrackInfo {
  public string Name { get; set; }
  public string District { get; set; }
  public string TrackId { get; set; }
  public Dictionary<string, string> ContactInfo { get; set; }
  public string LogoUrl { get; set; }
  public Location Location { get; set; }
  public string Website { get; set; }
  public string HtmlDescription { get; set; }
  public Dictionary<string, string> Socials { get; set; }
  public List<NamedLink> Sponsors { get; set; }
  public List<NamedLink> Coaches { get; set; }
  public List<string> Operators { get; set; }
}
