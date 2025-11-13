//
//  PUBG Mobile — JO Full-Force Smart PAC
//  هدفه: زيادة ظهور لاعبين ببجي من داخل الأردن قدر الإمكان
//  الفكرة الأساسية:
//    1) أي IPv6 أردني (من البادئات اللي تحت) → يروح على MATCH (بورت 20001)
//    2) غير هيك: روتين ذكي حسب LOBBY / MATCH / RECRUIT / UPDATES
//  البروكسي المستخدم: 212.35.66.45
//

// ================== MODES ==================
// COZY  = فقط ترافيك PUBG المعروف يمر من البروكسي
// HUNT  = أي إشي "شبيه ألعاب" clouds/cdn/game يمر من البروكسي
// RAW   = كل شيء غير لوكال عبر البروكسي
// ملاحظة: "Full Force Jordan" مفعّل دائماً فوق المودات هذه
var MODE = "COZY";   // غيّرها لو حاب: "COZY" أو "HUNT" أو "RAW"

// ================== PROXY BACKEND ==================
var PROXY_HOST = "212.35.66.45";

var LOBBY_PORT   = 10010; // لوجن / لوبي / حساب
var MATCH_PORT   = 20001; // الجيم الفعلي
var RECRUIT_PORT = 12000; // تيم أب / أصدقاء / تجنيد
var UPDT_PORT    = 8080;  // تحديثات / CDN / تحميلات

var LOBBY_PROXY   = "PROXY " + PROXY_HOST + ":" + LOBBY_PORT;
var MATCH_PROXY   = "PROXY " + PROXY_HOST + ":" + MATCH_PORT;
var RECRUIT_PROXY = "PROXY " + PROXY_HOST + ":" + RECRUIT_PORT;
var UPDT_PROXY    = "PROXY " + PROXY_HOST + ":" + UPDT_PORT;

var FALLBACK_DIRECT = "DIRECT";
var FALLBACK_PROXY  = MATCH_PROXY;

// ================== الأردن IPv6 — FULL FORCE ==================
//
// أي هوست IPv6 يبدأ بأي من هذه البادئات → يروح مباشرة على MATCH_PROXY
// هذا هو قلب السكربت لزيادة الأردنيين داخل الجيم.
//
var JORDAN_V6_PREFIXES = [
    "2a00:18d8:2000:",
    "2a00:18d9:",
    "2a01:9700:1000:",
    "2a02:1800:",
    "2a02:1801:",
    "2a02:1802:",
    "2a02:1803:",
    "2a02:2f00:",
    "2a02:2f01:",
    "2a02:2f02:",
    "2a02:2f03:",
    "2a02:2f04:",
    "2a02:800:",
    "2a02:801:",
    "2a02:8000:",
    "2a02:8002:",
    "2a02:840:",
    "2a02:841:",
    "2a02:8402:",
    "2a02:880:",
    "2a02:881:",
    "2a02:8801:",
    "2a02:8802:",
    "2a02:8c0:",
    "2a02:8c1:",
    "2a02:8c2:",
    "2a02:8c3:",
    "2a02:900:",
    "2a02:901:",
    "2a02:9002:",
    "2a02:9c0:",
    "2a02:a00:",
    "2a02:a01:",
    "2a02:be0:",
    "2a02:be1:",
    "2a02:bf0:",
    "2a02:bf1:",
    "2a03:b640:",
    "2a03:b640:1000:",
    "2a03:b641:",
    "2a03:b642:",
    "2a0d:1000:",
    "2a0d:3a00:",
    "2a0d:8d80:",
    "2a0d:8d81:",
    "2a0e:1c00:",
    "2a0e:97c0:",
    "2a0e:fc00:",
    "2a10:b9c0:",
    "2a14:c4c0:",
    "2a14:c4c1:",
    "2001:67c:27c0:",
    "2001:67c:27c1:",
    "2001:67c:27c4:"
];

// ================== PUBG DOMAIN GROUPS ==================

// LOBBY / LOGIN / SDK / ACCOUNT
var PUBG_LOBBY_PATTERNS = [
    "*.igamecj.com",
    "*.pubgmobile.com",
    "*.tencentgames.com",
    "ig-us-sdkapi.igamecj.com",
    "ig-us-gameapi.igamecj.com",
    "*.gamecenter.qq.com"
];

// MATCH / REAL-TIME / GAME SERVERS / LATENCY SENSITIVE
var PUBG_MATCH_PATTERNS = [
    "*.gcloud.qq.com",
    "*.qcloudcdn.com",
    "*.tencent-garena.com",
    "*.gpubgm.com",
    "*.qcloud.com"
];

// RECRUIT / TEAM-UP / SOCIAL / FRIENDS
var PUBG_RECRUIT_PATTERNS = [
    "*.facebook.com",
    "*.fbcdn.net",
    "*.graph.facebook.com",
    "*.googleapis.com",
    "*.googleusercontent.com",
    "playgames.google.com"
];

// UPDATES / PATCHES / CDN / STATIC
var PUBG_UPDT_PATTERNS = [
    "dl.pubgmobile.com",
    "*.cdn.pubgmobile.com",
    "*.download.igamecj.com",
    "*.patch.igamecj.com",
    "*.akamaized.net",
    "*.cloudfront.net"
];

// كلمات مفتاحية في الـ URL تعطي hint على النوع
var LOBBY_KEYWORDS   = ["login", "signin", "sdk", "lobby", "auth", "account"];
var MATCH_KEYWORDS   = ["match", "battle", "game", "play", "fight", "arena"];
var RECRUIT_KEYWORDS = ["teamup", "team-up", "invite", "friend", "squad", "recruit"];
var UPDT_KEYWORDS    = ["update", "patch", "cdn", "download", "version", "res", "resource"];

// ================== HELPERS ==================

function toLowerSafe(s) {
    if (!s) return "";
    return s.toLowerCase();
}

function containsAny(haystack, arr) {
    var s = haystack;
    for (var i = 0; i < arr.length; i++) {
        if (s.indexOf(arr[i]) !== -1) {
            return true;
        }
    }
    return false;
}

function hostMatchesAnyPattern(host, patterns) {
    for (var i = 0; i < patterns.length; i++) {
        if (shExpMatch(host, patterns[i])) {
            return true;
        }
    }
    return false;
}

function isPrivateIPv4(host) {
    if (isInNet(host, "10.0.0.0",  "255.0.0.0"))      return true;
    if (isInNet(host, "172.16.0.0","255.240.0.0"))    return true;
    if (isInNet(host, "192.168.0.0","255.255.0.0"))   return true;
    return false;
}

// محاولة بسيطة للتفريق بين IP و hostname
function looksLikeIP(host) {
    // IPv4
    var parts = host.split(".");
    if (parts.length === 4) {
        for (var i = 0; i < 4; i++) {
            var p = parts[i];
            var n = parseInt(p, 10);
            if (isNaN(n) || n < 0 || n > 255) {
                break;
            }
            if (i === 3) return true;
        }
    }
    // IPv6 (فيه ':')
    if (host.indexOf(":") !== -1) return true;
    return false;
}

// normalize IPv6 literal مثل [2001:db8::1] → 2001:db8::1
function normalizeIPv6Host(host) {
    var h = toLowerSafe(host);
    if (h.charAt(0) === "[" && h.charAt(h.length - 1) === "]") {
        h = h.substring(1, h.length - 1);
    }
    return h;
}

// هل هذا الهوست IPv6 أردني من اللستة فوق؟
function isJordanIPv6Host(host) {
    var h = normalizeIPv6Host(host);
    if (h.indexOf(":") === -1) return false; // مش IPv6
    for (var i = 0; i < JORDAN_V6_PREFIXES.length; i++) {
        var p = JORDAN_V6_PREFIXES[i];
        if (h.indexOf(p) === 0) {
            return true;
        }
    }
    return false;
}

// ================== PUBG CLASSIFIER ==================
// ترجع: "LOBBY" / "MATCH" / "RECRUIT" / "UPDATES" أو null
function classifyPubgTraffic(host, url) {
    var h = toLowerSafe(host);
    var u = toLowerSafe(url);

    // 1) بناءً على الدومين
    if (hostMatchesAnyPattern(h, PUBG_LOBBY_PATTERNS)) {
        return "LOBBY";
    }
    if (hostMatchesAnyPattern(h, PUBG_MATCH_PATTERNS)) {
        return "MATCH";
    }
    if (hostMatchesAnyPattern(h, PUBG_RECRUIT_PATTERNS)) {
        return "RECRUIT";
    }
    if (hostMatchesAnyPattern(h, PUBG_UPDT_PATTERNS)) {
        return "UPDATES";
    }

    // 2) PUBG عام (دومينات فيها pubg / tencent / igamecj) → نقرر حسب الـ URL
    if (containsAny(h, ["pubg", "igamecj", "tencent", "gcloud", "qcloud"])) {
        if (containsAny(u, LOBBY_KEYWORDS))   return "LOBBY";
        if (containsAny(u, MATCH_KEYWORDS))   return "MATCH";
        if (containsAny(u, RECRUIT_KEYWORDS)) return "RECRUIT";
        if (containsAny(u, UPDT_KEYWORDS))    return "UPDATES";
        // لو مش واضح → اعتبره MATCH لأنه أهم شيء
        return "MATCH";
    }

    // 3) فقط من الـ URL keywords (لو السيرفر IP أو دومين عام)
    if (containsAny(u, LOBBY_KEYWORDS))   return "LOBBY";
    if (containsAny(u, MATCH_KEYWORDS))   return "MATCH";
    if (containsAny(u, RECRUIT_KEYWORDS)) return "RECRUIT";
    if (containsAny(u, UPDT_KEYWORDS))    return "UPDATES";

    return null;
}

// ترجع البروكسي المناسب حسب الفئة
function proxyForClass(cls) {
    if (cls === "LOBBY")   return LOBBY_PROXY;
    if (cls === "MATCH")   return MATCH_PROXY;
    if (cls === "RECRUIT") return RECRUIT_PROXY;
    if (cls === "UPDATES") return UPDT_PROXY;
    return FALLBACK_PROXY;
}

// ================== MAIN ==================

function FindProxyForURL(url, host) {
    var h = toLowerSafe(host);
    var u = toLowerSafe(url);

    // 0) استثناءات أساسية: لوكال بدون DNS
    if (isPlainHostName(host)) {
        return FALLBACK_DIRECT;
    }

    // 1) شبكات خاصة IPv4 → DIRECT
    if (looksLikeIP(h) && isPrivateIPv4(h)) {
        return FALLBACK_DIRECT;
    }

    // 2) FULL FORCE JORDAN:
    //    أي IPv6 من البادئات الأردنية → MATCH_PROXY
    if (isJordanIPv6Host(host)) {
        return MATCH_PROXY;
    }

    // 3) مود RAW: كل شيء غير لوكال → بروكسي
    if (MODE === "RAW") {
        var cls_raw = classifyPubgTraffic(h, u);
        if (cls_raw !== null) {
            return proxyForClass(cls_raw);
        }
        return FALLBACK_PROXY;
    }

    // 4) PUBG Detection (أساسي)
    var cls = classifyPubgTraffic(h, u);
    if (cls !== null) {
        return proxyForClass(cls);
    }

    // 5) مود HUNT: أي دومين فيه game / play / cloud / cdn… خليه يمر من البروكسي
    if (MODE === "HUNT") {
        if (containsAny(h, ["game", "play", "cloud", "cdn", "steam", "epic"])) {
            return FALLBACK_PROXY;
        }
    }

    // 6) COZY (أو أي مود): باقي الترافيك → DIRECT
    return FALLBACK_DIRECT;
}
