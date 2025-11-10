function FindProxyForURL(url, host) {
  // Generated 2025-11-10T18:15:27.410037 — Gaming/Low-Latency PAC (IPv4 focus)
  var JO_PROXY = "127.0.0.1";
  var PORTS = {
    "LOBBY":   [10010],
    "MATCH":   [20001],
    "RECRUIT": [12000],
    "UPDATES": [8080]
  };

  // IPv4 Jordan list as [network, netmask]
  var V4 = [
  ["94.249.0.0", "255.255.128.0"],
  ["212.35.64.0", "255.255.224.0"],
  ["212.118.0.0", "255.255.224.0"],
  ["213.139.32.0", "255.255.240.0"],
  ["176.29.0.0", "255.255.128.0"],
  ];

  // helper: parse port from URL (if any)
  function urlPort(u) {
    // try to extract :port from scheme://host:port/...
    var m = u.match(/^\w+:\/\/\[?[^\]]*\]?(?::(\d+))?/);
    return m && m[1] ? parseInt(m[1],10) : 0;
  }

  var p = urlPort(url);

  // check if host resolves to IPv4 in any Jordan CIDR
  var ip = dnsResolve(host);
  if (ip) {
    for (var i=0;i<V4.length;i++) {
      var n=V4[i][0], m=V4[i][1];
      if (isInNet(ip, n, m)) {
        // choose proxy port by function group (prefer MATCH -> LOBBY -> RECRUIT -> UPDATES)
        if (PORTS.MATCH.indexOf(p) !== -1)   return "PROXY " + JO_PROXY + ":" + 20001;
        if (PORTS.LOBBY.indexOf(p) !== -1)   return "PROXY " + JO_PROXY + ":" + 10010;
        if (PORTS.RECRUIT.indexOf(p) !== -1) return "PROXY " + JO_PROXY + ":" + 12000;
        if (PORTS.UPDATES.indexOf(p) !== -1) return "PROXY " + JO_PROXY + ":" + 8080;
        // fallback: if it's inside Jordan but port unknown, still prefer lobby port
        return "PROXY " + JO_PROXY + ":" + 10010;
      }
    }
  }

  // Otherwise, go direct
  return "DIRECT";
}
