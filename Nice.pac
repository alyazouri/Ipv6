// =========================================
//  PUBG-aware PAC for IPv6 JO
//  Proxy: 212.35.66.45
//  لا يوجد DIRECT إطلاقاً
// =========================================

var PROXY_IP     = "212.35.66.45";
var FORBID_NON_JO = true;
var BLOCK_REPLY   = "PROXY 0.0.0.0:0";

// =========================================
//  PRIVATE / LOCAL CHECK
// =========================================

function isPrivateOrLocal(host) {
    if (isPlainHostName(host)) return true;

    var ip = dnsResolve(host);
    if (!ip) return false;

    if (isInNet(ip,"127.0.0.0","255.0.0.0"))    return true; // loopback
    if (isInNet(ip,"10.0.0.0","255.0.0.0"))     return true; // RFC1918
    if (isInNet(ip,"172.16.0.0","255.240.0.0")) return true; // RFC1918
    if (isInNet(ip,"192.168.0.0","255.255.0.0"))return true; // RFC1918
    if (isInNet(ip,"169.254.0.0","255.255.0.0"))return true; // link-local
    if (isInNet(ip,"100.64.0.0","255.192.0.0")) return true; // CGNAT

    return false;
}

// =========================================
//  JO IPv6 INTERVALS (min–max)
//  (من /prefix إلى start/end مضبوطين)
// =========================================

var JO_V6_INTERVALS = [
  { start: "2001:32c0:2000::", end: "2001:32c0:2fff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2001:32c0:6000::", end: "2001:32c0:6fff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2001:32c0:c000::", end: "2001:32c0:ffff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2001:32c1::",      end: "2001:32c1:ffff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2001:32c2::",      end: "2001:32c3:ffff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2001:32c4::",      end: "2001:32c7:ffff:ffff:ffff:ffff:ffff:ffff" },

  { start: "2a00:18d0:4000::", end: "2a00:18d0:5fff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2a00:18d0:6000::", end: "2a00:18d0:6fff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2a00:18d0:c000::", end: "2a00:18d0:ffff:ffff:ffff:ffff:ffff:ffff" },

  { start: "2a00:18d8:1000::", end: "2a00:18d8:1fff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2a00:18d8:4000::", end: "2a00:18d8:5fff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2a00:18d8:c000::", end: "2a00:18d8:ffff:ffff:ffff:ffff:ffff:ffff" },

  { start: "2a00:18d9::",      end: "2a00:18d9:ffff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2a00:18da::",      end: "2a00:18db:ffff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2a00:18dc::",      end: "2a00:18df:ffff:ffff:ffff:ffff:ffff:ffff" },

  { start: "2a03:6b00::",      end: "2a03:6b00:3fff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2a03:6b00:b000::", end: "2a03:6b00:bfff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2a03:6b00:c000::", end: "2a03:6b00:ffff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2a03:6b01::",      end: "2a03:6b01:ffff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2a03:6b02::",      end: "2a03:6b03:ffff:ffff:ffff:ffff:ffff:ffff" },
  { start: "2a03:6b04::",      end: "2a03:6b07:ffff:ffff:ffff:ffff:ffff:ffff" },

  { start: "2a03:b640::",      end: "2a03:b640:ffff:ffff:ffff:ffff:ffff:ffff" }
];

// =========================================
//  PUBG DOMAINS / KEYWORDS
// =========================================

var GAME_DOMAINS = [
  "igamecj.com","igamepubg.com","pubgmobile.com","tencentgames.com",
  "proximabeta.com","qcloudcdn.com","tencentyun.com","qcloud.com",
  "gtimg.com","game.qq.com","gameloop.com","proximabeta.net",
  "cdn-ota.qq.com","cdngame.tencentyun.com"
];

var KEYWORDS = [
  "pubg","tencent","igame","proximabeta","qcloud","tencentyun",
  "gcloud","gameloop","match","squad","party","team","rank"
];

// =========================================
/*  PORTS PER MODE (ثابتة، مش عشوائيّة)
    كلها ضمن 8000–65000
*/
// =========================================

var PORTS = {
    // لابي – كنترول – TLS style
    LOBBY:          [8443],

    // أهم شيء الجيم – نستخدم 20001 كبورت أساسي للمباراة
    MATCH:          [20001, 20003],

    // تجنيد وسكواد وغرف
    RECRUIT_SEARCH: [10012, 10013],

    // تحديثات/patch/OTA
    UPDATES:        [8080, 18080],

    // CDN / Assets / تحميل
    CDNs:           [28080, 38080]
};

function choosePort(mode) {
    var ports = PORTS[mode];
    if (!ports || ports.length === 0) {
        ports = PORTS["LOBBY"];
    }
    // مش عشوائي: دائماً أول بورت في اللستة
    return ports[0];
}

function buildProxy(mode) {
    var port = choosePort(mode);
    return "PROXY " + PROXY_IP + ":" + port;
}

// =========================================
//  IPv6 HELPERS
// =========================================

function expandIPv6(address) {
    var zone = address.indexOf("%");
    if (zone > 0) address = address.substring(0, zone);

    var parts = address.split("::");
    var head  = parts[0].split(":");
    var tail  = (parts.length > 1) ? parts[1].split(":") : [];

    function parse(arr){
        var out=[];
        for (var i=0;i<arr.length;i++){
            if (arr[i].length>0) out.push(parseInt(arr[i],16)||0);
        }
        return out;
    }

    head = parse(head);
    tail = parse(tail);

    var missing = 8 - (head.length + tail.length);
    var full = [];
    var i;

    for (i=0;i<head.length;i++) full.push(head[i]);
    for (i=0;i<missing;i++)    full.push(0);
    for (i=0;i<tail.length;i++) full.push(tail[i]);

    return full;
}

function cmpIPv6(a,b){
    for (var i=0;i<8;i++){
        if (a[i] < b[i]) return -1;
        if (a[i] > b[i]) return  1;
    }
    return 0;
}

function ip6_in_range(ip,start,end){
    var A = expandIPv6(ip);
    var S = expandIPv6(start);
    var E = expandIPv6(end);
    return (cmpIPv6(A,S) >= 0) && (cmpIPv6(A,E) <= 0);
}

function isJOIPv6(ip){
    if (!ip) return false;
    for (var i=0;i<JO_V6_INTERVALS.length;i++){
        var r = JO_V6_INTERVALS[i];
        if (ip6_in_range(ip,r.start,r.end)) return true;
    }
    return false;
}

function extractIPv6Host(host){
    if (!host) return null;

    // [ipv6]:port or [ipv6]
    if (host.charAt(0) === "[") {
        var idx = host.indexOf("]");
        if (idx > 0) return host.substring(1, idx);
    }

    // raw IPv6 literal بدون []
    if (host.indexOf(":") >= 0 && host.indexOf(".") < 0) {
        return host;
    }

    return null;
}

// =========================================
//  GAME DETECTION
// =========================================

function hostMatchesGameDomain(host){
    if (!host) return false;
    var h = host.toLowerCase();
    for (var i=0;i<GAME_DOMAINS.length;i++){
        var d = GAME_DOMAINS[i];
        if (dnsDomainIs(h,d) || shExpMatch(h,"*."+d)) return true;
    }
    return false;
}

function urlHasKeywords(url){
    var u = url.toLowerCase();
    for (var i=0;i<KEYWORDS.length;i++){
        if (u.indexOf(KEYWORDS[i]) !== -1) return true;
    }
    return false;
}

function detectMode(url,host){
    var u = url.toLowerCase();

    if (u.indexOf("match")  != -1 ||
        u.indexOf("squad")  != -1 ||
        u.indexOf("rank")   != -1 ||
        u.indexOf("team")   != -1)
        return "MATCH";

    if (u.indexOf("recruit")!= -1 ||
        u.indexOf("party")  != -1 ||
        u.indexOf("room")   != -1)
        return "RECRUIT_SEARCH";

    if (u.indexOf("update") != -1 ||
        u.indexOf("patch")  != -1 ||
        u.indexOf("ota")    != -1)
        return "UPDATES";

    if (u.indexOf("cdn")    != -1 ||
        u.indexOf("asset")  != -1)
        return "CDNs";

    return "LOBBY";
}

// =========================================
//  MAIN: FindProxyForURL
// =========================================

function FindProxyForURL(url, host) {

    // 1) Local/Private -> بروكسي على مود لابي افتراضياً
    if (isPrivateOrLocal(host)) {
        return buildProxy("LOBBY");
    }

    var ipv6   = extractIPv6Host(host);
    var jo     = isJOIPv6(ipv6);
    var isGame = hostMatchesGameDomain(host) || urlHasKeywords(url);
    var mode   = detectMode(url, host);

    // 2) IPv6 خارج الأردن + FORBID_NON_JO => بلوك كامل
    if (ipv6 && !jo && FORBID_NON_JO) {
        return BLOCK_REPLY;
    }

    // 3) أي ترافيك PUBG (IP أردني أو لا، IPv6 literal أو DNS) => بروكسي حسب المود
    if (isGame) {
        return buildProxy(mode);
    }

    // 4) باقي الترافيك (غير PUBG) -> برضو بروكسي (بدون DIRECT)
    return buildProxy("LOBBY");
}
