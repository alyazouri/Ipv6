// =====================================================
//  TURBO_LOCK_PLUS — أفضل موازنة بين الأداء ومسار الأردن
//  Proxy: 212.35.66.45
//  - لا يوجد DIRECT إطلاقاً
//  - PUBG لها بورتات خاصة حسب المود
//  - JO IPv6 intervals مضبوطة من → إلى
// =====================================================

var PROXY_IP       = "212.35.66.45";
var FORBID_NON_JO  = true;              // لو true: يمنع IPv6 خارج نطاقات الأردن إذا كان literal
var BLOCK_REPLY    = "PROXY 0.0.0.0:0";

// =====================================================
//  1) PRIVATE / LOCAL CHECK
// =====================================================

function isPrivateOrLocal(host) {
    if (isPlainHostName(host)) return true;

    var ip = dnsResolve(host);
    if (!ip) return false;

    if (isInNet(ip,"127.0.0.0","255.0.0.0"))     return true; // loopback
    if (isInNet(ip,"10.0.0.0","255.0.0.0"))      return true; // RFC1918
    if (isInNet(ip,"172.16.0.0","255.240.0.0"))  return true; // RFC1918
    if (isInNet(ip,"192.168.0.0","255.255.0.0")) return true; // RFC1918
    if (isInNet(ip,"169.254.0.0","255.255.0.0")) return true; // link-local
    if (isInNet(ip,"100.64.0.0","255.192.0.0"))  return true; // CGNAT

    return false;
}

// =====================================================
//  2) JO IPv6 INTERVALS (من /prefix إلى start/end)
//     النطاقات اللي انت عطيتني إياها بالضبط
// =====================================================

var JO_V6_INTERVALS = [
  { prefix: "2001:32c0:2000::/36", start: "2001:32c0:2000::", end: "2001:32c0:2fff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2001:32c0:6000::/36", start: "2001:32c0:6000::", end: "2001:32c0:6fff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2001:32c0:c000::/34", start: "2001:32c0:c000::", end: "2001:32c0:ffff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2001:32c1::/32",      start: "2001:32c1::",      end: "2001:32c1:ffff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2001:32c2::/31",      start: "2001:32c2::",      end: "2001:32c3:ffff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2001:32c4::/30",      start: "2001:32c4::",      end: "2001:32c7:ffff:ffff:ffff:ffff:ffff:ffff" },

  { prefix: "2a00:18d0:4000::/35", start: "2a00:18d0:4000::", end: "2a00:18d0:5fff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2a00:18d0:6000::/36", start: "2a00:18d0:6000::", end: "2a00:18d0:6fff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2a00:18d0:c000::/34", start: "2a00:18d0:c000::", end: "2a00:18d0:ffff:ffff:ffff:ffff:ffff:ffff" },

  { prefix: "2a00:18d8:1000::/36", start: "2a00:18d8:1000::", end: "2a00:18d8:1fff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2a00:18d8:4000::/35", start: "2a00:18d8:4000::", end: "2a00:18d8:5fff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2a00:18d8:c000::/34", start: "2a00:18d8:c000::", end: "2a00:18d8:ffff:ffff:ffff:ffff:ffff:ffff" },

  { prefix: "2a00:18d9::/32",      start: "2a00:18d9::",      end: "2a00:18d9:ffff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2a00:18da::/31",      start: "2a00:18da::",      end: "2a00:18db:ffff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2a00:18dc::/30",      start: "2a00:18dc::",      end: "2a00:18df:ffff:ffff:ffff:ffff:ffff:ffff" },

  { prefix: "2a03:6b00::/34",      start: "2a03:6b00::",      end: "2a03:6b00:3fff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2a03:6b00:b000::/36", start: "2a03:6b00:b000::", end: "2a03:6b00:bfff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2a03:6b00:c000::/34", start: "2a03:6b00:c000::", end: "2a03:6b00:ffff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2a03:6b01::/32",      start: "2a03:6b01::",      end: "2a03:6b01:ffff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2a03:6b02::/31",      start: "2a03:6b02::",      end: "2a03:6b03:ffff:ffff:ffff:ffff:ffff:ffff" },
  { prefix: "2a03:6b04::/30",      start: "2a03:6b04::",      end: "2a03:6b07:ffff:ffff:ffff:ffff:ffff:ffff" },

  { prefix: "2a03:b640::/32",      start: "2a03:b640::",      end: "2a03:b640:ffff:ffff:ffff:ffff:ffff:ffff" }
];

// =====================================================
//  3) IPv6 HELPERS
// =====================================================

function expandIPv6(address) {
    var zoneIndex = address.indexOf("%");
    if (zoneIndex > 0) {
        address = address.substring(0, zoneIndex);
    }

    var parts = address.split("::");
    var head = parts[0].split(":");
    var tail = (parts.length > 1) ? parts[1].split(":") : [];

    function parsePart(arr) {
        var out = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].length === 0) continue;
            out.push(parseInt(arr[i], 16) || 0);
        }
        return out;
    }

    head = parsePart(head);
    tail = parsePart(tail);

    var missing = 8 - (head.length + tail.length);
    var full = [];
    var i;

    for (i = 0; i < head.length; i++) full.push(head[i]);
    for (i = 0; i < missing; i++)    full.push(0);
    for (i = 0; i < tail.length; i++) full.push(tail[i]);

    return full;
}

function cmpIPv6(a, b) {
    for (var i = 0; i < 8; i++) {
        if (a[i] < b[i]) return -1;
        if (a[i] > b[i]) return 1;
    }
    return 0;
}

function ip6_in_range(ip, start, end) {
    var ipArr    = expandIPv6(ip);
    var startArr = expandIPv6(start);
    var endArr   = expandIPv6(end);
    return (cmpIPv6(ipArr, startArr) >= 0) && (cmpIPv6(ipArr, endArr) <= 0);
}

function isJOIPv6(ip) {
    if (!ip) return false;
    for (var i = 0; i < JO_V6_INTERVALS.length; i++) {
        var r = JO_V6_INTERVALS[i];
        if (ip6_in_range(ip, r.start, r.end)) {
            return true;
        }
    }
    return false;
}

function extractIPv6Host(host) {
    if (!host) return null;

    // [ipv6]:port أو [ipv6]
    if (host.charAt(0) === "[") {
        var idx = host.indexOf("]");
        if (idx > 0) {
            return host.substring(1, idx);
        }
    }

    // IPv6 بدون []
    if (host.indexOf(":") >= 0 && host.indexOf(".") < 0) {
        return host;
    }

    return null;
}

// =====================================================
//  4) PUBG SIGNATURES (DOMAINS + KEYWORDS)
// =====================================================

var GAME_DOMAINS = [
  "igamecj.com","igamepubg.com","pubgmobile.com","tencentgames.com",
  "proximabeta.com","proximabeta.net","qcloudcdn.com","tencentyun.com",
  "qcloud.com","gtimg.com","game.qq.com","gameloop.com",
  "cdn-ota.qq.com","cdngame.tencentyun.com"
];

var KEYWORDS = [
  "pubg","tencent","igame","proximabeta","qcloud","tencentyun",
  "gcloud","gameloop","match","squad","party","team","rank","room"
];

function hostMatchesGameDomain(host) {
    if (!host) return false;
    var h = host.toLowerCase();
    for (var i = 0; i < GAME_DOMAINS.length; i++) {
        var d = GAME_DOMAINS[i];
        if (dnsDomainIs(h, d) || shExpMatch(h, "*." + d)) {
            return true;
        }
    }
    return false;
}

function urlHasKeywords(url) {
    if (!url) return false;
    var u = url.toLowerCase();
    for (var i = 0; i < KEYWORDS.length; i++) {
        if (u.indexOf(KEYWORDS[i]) !== -1) {
            return true;
        }
    }
    return false;
}

// =====================================================
//  5) MODE DETECTION (LOBBY / MATCH / RECRUIT / UPDATES / CDNS)
// =====================================================

function detectMode(url) {
    var u = url.toLowerCase();

    if (u.indexOf("match") !== -1 || u.indexOf("squad") !== -1 ||
        u.indexOf("rank")  !== -1 || u.indexOf("team")  !== -1) {
        return "MATCH";
    }

    if (u.indexOf("recruit") !== -1 || u.indexOf("party") !== -1 ||
        u.indexOf("room")    !== -1) {
        return "RECRUIT";
    }

    if (u.indexOf("update") !== -1 || u.indexOf("patch") !== -1 ||
        u.indexOf("ota")    !== -1) {
        return "UPDATES";
    }

    if (u.indexOf("cdn")   !== -1 || u.indexOf("asset") !== -1) {
        return "CDNS";
    }

    return "LOBBY";
}

// =====================================================
//  6) PORTS PER MODE (مختارة حسب اللعبة & ضمن 8000–65000)
// =====================================================

var PORTS = {
    LOBBY:          8443,    // منيو / كنترول
    MATCH:          20001,   // جيم / ماتش فعلي
    RECRUIT_SEARCH: 10012,   // سكواد / تيم / روم
    UPDATES:        8080,    // تحديثات / OTA / Patch
    CDNS:           28080    // CDN / Assets
};

function buildProxy(mode) {
    var port = PORTS[mode];
    if (!port) port = PORTS.LOBBY;
    return "PROXY " + PROXY_IP + ":" + port;
}

// =====================================================
//  7) MAIN — FindProxyForURL
// =====================================================

function FindProxyForURL(url, host) {

    // 1) لو الهدف داخلي / لوكال → برضه بروكسي (بس على بورت لابي)
    if (isPrivateOrLocal(host)) {
        return buildProxy("LOBBY");
    }

    var ipv6   = extractIPv6Host(host);
    var isGame = hostMatchesGameDomain(host) || urlHasKeywords(url);

    // 2) لو IPv6 literal ومش أردني + FORBID_NON_JO → بلوك (منع هروب لمسارات غريبة)
    if (ipv6 && !isJOIPv6(ipv6) && FORBID_NON_JO) {
        return BLOCK_REPLY;
    }

    // 3) PUBG → بروكسي حسب المود على بورتات خاصة
    if (isGame) {
        var mode = detectMode(url);
        return buildProxy(mode);
    }

    // 4) أي شيء ثاني → برضه بروكسي (لا يوجد DIRECT نهائيًا)
    return buildProxy("LOBBY");
}
