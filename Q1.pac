// ===================== IPv6 Range Check =====================

function ip6_in_range(ip, start, end) {

    function expandIPv6(address) {
        // يشيل الأقواس لو جاي [2001:...]
        address = address.replace(/^\[|\]$/g, "").toLowerCase();

        var main = address;
        if (main.indexOf("::") !== -1) {
            var parts = main.split("::");
            var left = parts[0].length ? parts[0].split(":") : [];
            var right = parts[1].length ? parts[1].split(":") : [];
            var missing = 8 - (left.length + right.length);
            var mid = [];
            for (var i = 0; i < missing; i++) mid.push("0");
            main = (left.join(":") + ":" + mid.join(":") + ":" + right.join(":")).replace(/^:|:$/g, "");
        }

        var partsAll = main.split(":");
        // تأكد إنها 8 بلوكات
        var full = [];
        for (var j = 0; j < 8; j++) {
            var part = partsAll[j] || "0";
            full.push(parseInt(part, 16));
        }
        return full;
    }

    function toBigInt(parts) {
        var v = 0n;
        for (var i = 0; i < parts.length; i++) {
            v = (v << 16n) + BigInt(parts[i]);
        }
        return v;
    }

    try {
        var ipNum    = toBigInt(expandIPv6(ip));
        var startNum = toBigInt(expandIPv6(start));
        var endNum   = toBigInt(expandIPv6(end));
        return (ipNum >= startNum && ipNum <= endNum);
    } catch (e) {
        return false;
    }
}

// ===================== Intervals (من الأوسع للأقل) =====================

var JO_V6_INTERVALS = [

    // /40  2a03:b640:1000::/40  → يغطي 2a03:b640:1000 - 2a03:b640:10ff
    {
        start: "2a03:b640:1000::",
        end:   "2a03:b640:10ff:ffff:ffff:ffff:ffff"
    },

    // تقريباً ~ /47 (يغطي b170 و b171)
    {
        start: "2a00:b860:b170::",
        end:   "2a00:b860:b171:ff:ffff:ffff:ffff:ffff"
    },

    // تقريباً ~ /47 (يغطي b400 و b401)
    {
        start: "2a00:caa0:b400::",
        end:   "2a00:caa0:b401:ff:ffff:ffff:ffff:ffff"
    },

    // /48  2a00:caa0:6000::/48
    {
        start: "2a00:caa0:6000::",
        end:   "2a00:caa0:6000:ffff:ffff:ffff:ffff:ffff"
    },

    // /48  2a00:caa0:9000::/48
    {
        start: "2a00:caa0:9000::",
        end:   "2a00:caa0:9000:ffff:ffff:ffff:ffff:ffff"
    },

    // /48  2a00:caa0:9100::/48
    {
        start: "2a00:caa0:9100::",
        end:   "2a00:caa0:9100:ffff:ffff:ffff:ffff:ffff"
    },

    // /48  2001:67c:27c0::/48
    {
        start: "2001:67c:27c0::",
        end:   "2001:67c:27c0:ffff:ffff:ffff:ffff:ffff"
    },

    // /48  2001:67c:27c1::/48
    {
        start: "2001:67c:27c1::",
        end:   "2001:67c:27c1:ffff:ffff:ffff:ffff:ffff"
    }
];

// ===================== PUBG SPLIT CONFIG =====================

// IP البروكسي الأساسي
var PROXY_HOST = "212.35.66.45";

// بورتات لكل وظيفة
var PORT_DEFAULT = 20001; // أي شيء غير PUBG أو PUBG بدون كاتيجوري واضحة
var PORT_LOBBY   = 10010;
var PORT_MATCH   = 20001;
var PORT_RECRUIT = 12000;
var PORT_UPDATES = 5000;

// يبني سترنج البروكسي حسب الكاتيجوري
function proxyForCategory(category) {
    var port;
    switch (category) {
        case "LOBBY":
            port = PORT_LOBBY;
            break;
        case "MATCH":
            port = PORT_MATCH;
            break;
        case "RECRUIT":
            port = PORT_RECRUIT;
            break;
        case "UPDATES":
            port = PORT_UPDATES;
            break;
        default:
            port = PORT_DEFAULT;
    }
    return "SOCKS5 " + PROXY_HOST + ":" + port;
}

// يحدد إذا الهوست تابع لـ PUBG و يرجّع الكاتيجوري
function getPUBGCategory(host) {
    host = host.toLowerCase();

    // هل هذا هوست PUBG أصلاً؟
    var isPUBG =
        shExpMatch(host, "*.pubgmobile.com") ||
        shExpMatch(host, "*pubgmobile.com")  ||
        shExpMatch(host, "*.igamecj.com")    ||
        shExpMatch(host, "*pubg.qq.com");

    if (!isPUBG) {
        return null;
    }

    // لـــوبــي
    if (shExpMatch(host, "*lobby*")) {
        return "LOBBY";
    }

    // مــاتــش / جيم / ستارت
    if (shExpMatch(host, "*match*")  ||
        shExpMatch(host, "*game*")   ||
        shExpMatch(host, "*battle*") ||
        shExpMatch(host, "*start*")) {
        return "MATCH";
    }

    // تــجــنـيــد / كلانات
    if (shExpMatch(host, "*recruit*") ||
        shExpMatch(host, "*clan*")    ||
        shExpMatch(host, "*team*")) {
        return "RECRUIT";
    }

    // تحديثات / CDN / تحميلات
    if (shExpMatch(host, "*update*")   ||
        shExpMatch(host, "*cdn*")      ||
        shExpMatch(host, "*patch*")    ||
        shExpMatch(host, "*download*")) {
        return "UPDATES";
    }

    // لو PUBG بس مش واضح → اعتبره MATCH
    return "MATCH";
}

// helper: هل الـ host عبارة عن IPv6 literal
function isIPv6LiteralHost(h) {
    return h.indexOf(":") !== -1;
}

// ===================== MAIN PAC =====================

function FindProxyForURL(url, host) {

    if (!host) {
        return proxyForCategory(null);
    }

    // تنظيف host (شيل الأقواس من IPv6 literal)
    host = host.replace(/^\[|\]$/g, "");

    // استثناءات أساسية: أسماء مضيفة محلية بدون نقطة → DIRECT
    if (isPlainHostName(host)) {
        return "DIRECT";
    }

    // لو host نفسه IPv6 literal (2a03:..., 2001:67c:...)
    if (isIPv6LiteralHost(host)) {
        // نتحقق لو ضمن النطاقات الأردنية (حالياً بس لفلترة داخلية، اختيار البورت يتم من الكاتيجوري)
        var isJOv6 = false;
        for (var k = 0; k < JO_V6_INTERVALS.length; k++) {
            var r0 = JO_V6_INTERVALS[k];
            if (ip6_in_range(host, r0.start, r0.end)) {
                isJOv6 = true;
                break;
            }
        }
        // IPv6 literal مش PUBG → بروكسي على البورت الافتراضي
        return proxyForCategory(null);
    }

    // تحديد كاتيجوري PUBG (لو موجود)
    var pubgCategory = getPUBGCategory(host);
    var selectedProxy = proxyForCategory(pubgCategory);

    // نحاول نحل الـ DNS عشان IPv6 الأردني
    var ip = null;
    try {
        if (typeof dnsResolveEx === "function") {
            ip = dnsResolveEx(host);
        } else {
            ip = dnsResolve(host);
        }
    } catch (e) {
        // لو فشل، رجّع البروكسي المختار (PUBG/non-PUBG)
        return selectedProxy;
    }

    if (ip && ip.indexOf(":") !== -1) {
        // IPv6: نتحقق لو ضمن النطاقات الأردنية
        var isJO = false;
        for (var i = 0; i < JO_V6_INTERVALS.length; i++) {
            var r = JO_V6_INTERVALS[i];
            if (ip6_in_range(ip, r.start, r.end)) {
                isJO = true;
                break;
            }
        }
        // حالياً: سواء JO أو لا → نستخدم selectedProxy (لأنك على نفس البروكسي IP)
        return selectedProxy;
    }

    // IPv4 أو ما قدر يحوّل → برضه على نفس البروكسي
    return selectedProxy;
}// ===================== IPv6 Range Check =====================

function ip6_in_range(ip, start, end) {

    function expandIPv6(address) {
        // يشيل الأقواس لو جاي [2001:...]
        address = address.replace(/^\[|\]$/g, "").toLowerCase();

        var main = address;
        if (main.indexOf("::") !== -1) {
            var parts = main.split("::");
            var left = parts[0].length ? parts[0].split(":") : [];
            var right = parts[1].length ? parts[1].split(":") : [];
            var missing = 8 - (left.length + right.length);
            var mid = [];
            for (var i = 0; i < missing; i++) mid.push("0");
            main = (left.join(":") + ":" + mid.join(":") + ":" + right.join(":")).replace(/^:|:$/g, "");
        }

        var partsAll = main.split(":");
        // تأكد إنها 8 بلوكات
        var full = [];
        for (var j = 0; j < 8; j++) {
            var part = partsAll[j] || "0";
            full.push(parseInt(part, 16));
        }
        return full;
    }

    function toBigInt(parts) {
        var v = 0n;
        for (var i = 0; i < parts.length; i++) {
            v = (v << 16n) + BigInt(parts[i]);
        }
        return v;
    }

    try {
        var ipNum    = toBigInt(expandIPv6(ip));
        var startNum = toBigInt(expandIPv6(start));
        var endNum   = toBigInt(expandIPv6(end));
        return (ipNum >= startNum && ipNum <= endNum);
    } catch (e) {
        return false;
    }
}

// ===================== Intervals (من الأوسع للأقل) =====================

var JO_V6_INTERVALS = [

    // /40  2a03:b640:1000::/40  → يغطي 2a03:b640:1000 - 2a03:b640:10ff
    {
        start: "2a03:b640:1000::",
        end:   "2a03:b640:10ff:ffff:ffff:ffff:ffff"
    },

    // تقريباً ~ /47 (يغطي b170 و b171)
    {
        start: "2a00:b860:b170::",
        end:   "2a00:b860:b171:ff:ffff:ffff:ffff:ffff"
    },

    // تقريباً ~ /47 (يغطي b400 و b401)
    {
        start: "2a00:caa0:b400::",
        end:   "2a00:caa0:b401:ff:ffff:ffff:ffff:ffff"
    },

    // /48  2a00:caa0:6000::/48
    {
        start: "2a00:caa0:6000::",
        end:   "2a00:caa0:6000:ffff:ffff:ffff:ffff:ffff"
    },

    // /48  2a00:caa0:9000::/48
    {
        start: "2a00:caa0:9000::",
        end:   "2a00:caa0:9000:ffff:ffff:ffff:ffff:ffff"
    },

    // /48  2a00:caa0:9100::/48
    {
        start: "2a00:caa0:9100::",
        end:   "2a00:caa0:9100:ffff:ffff:ffff:ffff:ffff"
    },

    // /48  2001:67c:27c0::/48
    {
        start: "2001:67c:27c0::",
        end:   "2001:67c:27c0:ffff:ffff:ffff:ffff:ffff"
    },

    // /48  2001:67c:27c1::/48
    {
        start: "2001:67c:27c1::",
        end:   "2001:67c:27c1:ffff:ffff:ffff:ffff:ffff"
    }
];

// ===================== PUBG SPLIT CONFIG =====================

// IP البروكسي الأساسي
var PROXY_HOST = "212.35.66.45";

// بورتات لكل وظيفة
var PORT_DEFAULT = 20001; // أي شيء غير PUBG أو PUBG بدون كاتيجوري واضحة
var PORT_LOBBY   = 10010;
var PORT_MATCH   = 20001;
var PORT_RECRUIT = 12000;
var PORT_UPDATES = 5000;

// يبني سترنج البروكسي حسب الكاتيجوري
function proxyForCategory(category) {
    var port;
    switch (category) {
        case "LOBBY":
            port = PORT_LOBBY;
            break;
        case "MATCH":
            port = PORT_MATCH;
            break;
        case "RECRUIT":
            port = PORT_RECRUIT;
            break;
        case "UPDATES":
            port = PORT_UPDATES;
            break;
        default:
            port = PORT_DEFAULT;
    }
    return "SOCKS5 " + PROXY_HOST + ":" + port;
}

// يحدد إذا الهوست تابع لـ PUBG و يرجّع الكاتيجوري
function getPUBGCategory(host) {
    host = host.toLowerCase();

    // هل هذا هوست PUBG أصلاً؟
    var isPUBG =
        shExpMatch(host, "*.pubgmobile.com") ||
        shExpMatch(host, "*pubgmobile.com")  ||
        shExpMatch(host, "*.igamecj.com")    ||
        shExpMatch(host, "*pubg.qq.com");

    if (!isPUBG) {
        return null;
    }

    // لـــوبــي
    if (shExpMatch(host, "*lobby*")) {
        return "LOBBY";
    }

    // مــاتــش / جيم / ستارت
    if (shExpMatch(host, "*match*")  ||
        shExpMatch(host, "*game*")   ||
        shExpMatch(host, "*battle*") ||
        shExpMatch(host, "*start*")) {
        return "MATCH";
    }

    // تــجــنـيــد / كلانات
    if (shExpMatch(host, "*recruit*") ||
        shExpMatch(host, "*clan*")    ||
        shExpMatch(host, "*team*")) {
        return "RECRUIT";
    }

    // تحديثات / CDN / تحميلات
    if (shExpMatch(host, "*update*")   ||
        shExpMatch(host, "*cdn*")      ||
        shExpMatch(host, "*patch*")    ||
        shExpMatch(host, "*download*")) {
        return "UPDATES";
    }

    // لو PUBG بس مش واضح → اعتبره MATCH
    return "MATCH";
}

// helper: هل الـ host عبارة عن IPv6 literal
function isIPv6LiteralHost(h) {
    return h.indexOf(":") !== -1;
}

// ===================== MAIN PAC =====================

function FindProxyForURL(url, host) {

    if (!host) {
        return proxyForCategory(null);
    }

    // تنظيف host (شيل الأقواس من IPv6 literal)
    host = host.replace(/^\[|\]$/g, "");

    // استثناءات أساسية: أسماء مضيفة محلية بدون نقطة → DIRECT
    if (isPlainHostName(host)) {
        return "DIRECT";
    }

    // لو host نفسه IPv6 literal (2a03:..., 2001:67c:...)
    if (isIPv6LiteralHost(host)) {
        // نتحقق لو ضمن النطاقات الأردنية (حالياً بس لفلترة داخلية، اختيار البورت يتم من الكاتيجوري)
        var isJOv6 = false;
        for (var k = 0; k < JO_V6_INTERVALS.length; k++) {
            var r0 = JO_V6_INTERVALS[k];
            if (ip6_in_range(host, r0.start, r0.end)) {
                isJOv6 = true;
                break;
            }
        }
        // IPv6 literal مش PUBG → بروكسي على البورت الافتراضي
        return proxyForCategory(null);
    }

    // تحديد كاتيجوري PUBG (لو موجود)
    var pubgCategory = getPUBGCategory(host);
    var selectedProxy = proxyForCategory(pubgCategory);

    // نحاول نحل الـ DNS عشان IPv6 الأردني
    var ip = null;
    try {
        if (typeof dnsResolveEx === "function") {
            ip = dnsResolveEx(host);
        } else {
            ip = dnsResolve(host);
        }
    } catch (e) {
        // لو فشل، رجّع البروكسي المختار (PUBG/non-PUBG)
        return selectedProxy;
    }

    if (ip && ip.indexOf(":") !== -1) {
        // IPv6: نتحقق لو ضمن النطاقات الأردنية
        var isJO = false;
        for (var i = 0; i < JO_V6_INTERVALS.length; i++) {
            var r = JO_V6_INTERVALS[i];
            if (ip6_in_range(ip, r.start, r.end)) {
                isJO = true;
                break;
            }
        }
        // حالياً: سواء JO أو لا → نستخدم selectedProxy (لأنك على نفس البروكسي IP)
        return selectedProxy;
    }

    // IPv4 أو ما قدر يحوّل → برضه على نفس البروكسي
    return selectedProxy;
}
