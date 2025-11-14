// =====================================================
//  JO_PUBG_SIMPLE_BEST.pac
//  - كل ترافيك PUBG عبر بروكسي أردني 212.35.66.45
//  - لا يوجد DIRECT نهائياً
//  - تقسيم مودات PUBG على بورتات ثابتة (8000–65000)
// =====================================================

var PROXY_IP = "212.35.66.45";

// بورتات مختارة داخل 8000–65000 حسب طريقة شغل اللعبة
var PORTS = {
    LOBBY:          8443,    // منيو / كنترول
    MATCH:          20001,   // الجيم الفعلي
    RECRUIT_SEARCH: 10012,   // تجنيد / سكواد / روم
    UPDATES:        8080,    // تحديثات / OTA
    CDNS:           28080    // CDN / Assets
};

// =========================
// PRIVATE / LOCAL
// =========================
function isPrivateOrLocal(host) {
    if (isPlainHostName(host)) return true;

    var ip = dnsResolve(host);
    if (!ip) return false;

    if (isInNet(ip,"127.0.0.0","255.0.0.0"))     return true;
    if (isInNet(ip,"10.0.0.0","255.0.0.0"))      return true;
    if (isInNet(ip,"172.16.0.0","255.240.0.0"))  return true;
    if (isInNet(ip,"192.168.0.0","255.255.0.0")) return true;
    if (isInNet(ip,"169.254.0.0","255.255.0.0")) return true;
    if (isInNet(ip,"100.64.0.0","255.192.0.0"))  return true;

    return false;
}

// =========================
// PUBG SIGNATURES
// =========================

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
        if (dnsDomainIs(h, d) || shExpMatch(h, "*." + d)) return true;
    }
    return false;
}

function urlHasKeywords(url) {
    if (!url) return false;
    var u = url.toLowerCase();
    for (var i = 0; i < KEYWORDS.length; i++) {
        if (u.indexOf(KEYWORDS[i]) !== -1) return true;
    }
    return false;
}

function isPubgTraffic(url, host) {
    return hostMatchesGameDomain(host) || urlHasKeywords(url);
}

// =========================
// MODE DETECTION
// =========================

function detectMode(url) {
    var u = url.toLowerCase();

    if (u.indexOf("match") !== -1 || u.indexOf("squad") !== -1 ||
        u.indexOf("rank")  !== -1 || u.indexOf("team")  !== -1)
        return "MATCH";

    if (u.indexOf("recruit") !== -1 || u.indexOf("party") !== -1 ||
        u.indexOf("room")    !== -1)
        return "RECRUIT_SEARCH";

    if (u.indexOf("update") !== -1 || u.indexOf("patch") !== -1 ||
        u.indexOf("ota")    !== -1)
        return "UPDATES";

    if (u.indexOf("cdn")   !== -1 || u.indexOf("asset") !== -1)
        return "CDNS";

    return "LOBBY";
}

function buildProxy(mode) {
    var port = PORTS[mode];
    if (!port) port = PORTS.LOBBY;
    return "PROXY " + PROXY_IP + ":" + port;
}

// =========================
// MAIN
// =========================

function FindProxyForURL(url, host) {

    // 1) لوكال / LAN → برضه بروكسي (ما في DIRECT)
    if (isPrivateOrLocal(host)) {
        return buildProxy("LOBBY");
    }

    var isGame = isPubgTraffic(url, host);

    // 2) PUBG → بروكسي على بورت حسب المود
    if (isGame) {
        var mode = detectMode(url);
        return buildProxy(mode);
    }

    // 3) أي شيء ثاني → بروكسي لابي
    return buildProxy("LOBBY");
}
