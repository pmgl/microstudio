define("ace/mode/microscript_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function(e, t, n) {
    "use strict";
    var r = e("../lib/oop"),
        i = e("./text_highlight_rules").TextHighlightRules,
        s = function() {
            var e = "continue|break|else|elsif|end|for|by|function|if|in|to|local|return|then|while|or|and|not|object|class|extends|new|this|super|global",
                t = "true|false",
                n = "print|time|type|log|max|PI|pow|random|ceil|round|floor|abs|sqrt|min|exp|sin|atan|concat|sort|cos|sin|tan|acos|asin|atan|atan2|sind|cosd|tand|acosd|asind|atand|atan2d",
                r = "screen|system|audio|gamepad|keyboard|touch|mouse",
                i = "setn|foreach|foreachi|gcinfo|log10|maxn",
                s = this.createKeywordMapper({
                    keyword: e,
                    "support.function": n,
                    "keyword.deprecated": i,
                    "constant.library": r,
                    "constant.language": t,
                    "variable.language": "this"
                }, "identifier"),
                o = "(?:(?:[1-9]\\d*)|(?:0))",
                u = "(?:0[xX][\\dA-Fa-f]+)",
                a = "(?:" + o + "|" + u + ")",
                f = "(?:\\.\\d+)",
                l = "(?:\\d+)",
                c = "(?:(?:" + l + "?" + f + ")|(?:" + l + "\\.))",
                h = "(?:" + c + ")";
            this.$rules = {
                start: [{
                    token: "comment",
                    regex: "\\/\\/.*$"
                }, {
                    token: "string",
                    regex: '"(?:[^\\\\]|\\\\.)*?"'
                }, {
                    token: "string",
                    regex: "'(?:[^\\\\]|\\\\.)*?'"
                }, {
                    token: "constant.numeric",
                    regex: h
                }, {
                    token: "constant.numeric",
                    regex: a + "\\b"
                }, {
                    token: s,
                    regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                }, {
                    token: "keyword.operator",
                    regex: "\\+|\\-|\\*|\\/|%|\\^|<|>|<=|=>|==|="
                }, {
                    token: "paren.lparen",
                    regex: "[\\[\\(\\{]"
                }, {
                    token: "paren.rparen",
                    regex: "[\\]\\)\\}]"
                }, {
                    token: "text",
                    regex: "\\s+|\\w+"
                }]
            }, this.normalizeRules()
        };
    r.inherits(s, i), t.MicroscriptHighlightRules = s
}), define("ace/mode/folding/microscript", ["require", "exports", "module", "ace/lib/oop", "ace/mode/folding/fold_mode", "ace/range", "ace/token_iterator"], function(e, t, n) {
    "use strict";
    var r = e("../../lib/oop"),
        i = e("./fold_mode").FoldMode,
        s = e("../../range").Range,
        o = e("../../token_iterator").TokenIterator,
        u = t.FoldMode = function() {};
    r.inherits(u, i),
        function() {
            this.foldingStartMarker = /\b(function|then|while|for|repeat|class|object)\b|{\s*$|(\[=*\[)/, this.foldingStopMarker = /\bend\b|^\s*}|\]=*\]/, this.getFoldWidget = function(e, t, n) {
                var r = e.getLine(n),
                    i = this.foldingStartMarker.test(r),
                    s = this.foldingStopMarker.test(r);
                if (i && !s) {
                    var o = r.match(this.foldingStartMarker);
                    if (o[1] == "then" && /\belseif\b/.test(r)) return;
                    if (o[1]) {
                        if (e.getTokenAt(n, o.index + 1).type === "keyword") return "start"
                    } else {
                        if (!o[2]) return "start";
                        var u = e.bgTokenizer.getState(n) || "";
                        if (u[0] == "bracketedComment" || u[0] == "bracketedString") return "start"
                    }
                }
                if (t != "markbeginend" || !s || i && s) return "";
                var o = r.match(this.foldingStopMarker);
                if (o[0] === "end") {
                    if (e.getTokenAt(n, o.index + 1).type === "keyword") return "end"
                } else {
                    if (o[0][0] !== "]") return "end";
                    var u = e.bgTokenizer.getState(n - 1) || "";
                    if (u[0] == "bracketedComment" || u[0] == "bracketedString") return "end"
                }
            }, this.getFoldWidgetRange = function(e, t, n) {
                var r = e.doc.getLine(n),
                    i = this.foldingStartMarker.exec(r);
                if (i) return i[1] ? this.microscriptBlock(e, n, i.index + 1) : i[2] ? e.getCommentFoldRange(n, i.index + 1) : this.openingBracketBlock(e, "{", n, i.index);
                var i = this.foldingStopMarker.exec(r);
                if (i) return i[0] === "end" && e.getTokenAt(n, i.index + 1).type === "keyword" ? this.microscriptBlock(e, n, i.index + 1) : i[0][0] === "]" ? e.getCommentFoldRange(n, i.index + 1) : this.closingBracketBlock(e, "}", n, i.index + i[0].length)
            }, this.microscriptBlock = function(e, t, n, r) {
                var i = new o(e, t, n),
                    u = {
                        "function": 1,
                        then: 1,
                        elsif: -1,
                        end: -1,
                        "while": 1,
                        "for": 1,
                        "object": 1,
                        "class": 1
                    },
                    a = i.getCurrentToken();
                if (!a || a.type != "keyword") return;
                var f = a.value,
                    l = [f],
                    c = u[f];
                if (!c) return;
                var h = c === -1 ? i.getCurrentTokenColumn() : e.getLine(t).length,
                    p = t;
                i.step = c === -1 ? i.stepBackward : i.stepForward;
                while (a = i.step()) {
                    if (a.type !== "keyword") continue;
                    var d = c * u[a.value];
                    if (d > 0) l.unshift(a.value);
                    else if (d <= 0) {
                        l.shift();
                        if (!l.length && a.value != "elsif") break;
                        d === 0 && l.unshift(a.value)
                    }
                }
                if (!a) return null;
                if (r) return i.getCurrentTokenRange();
                var t = i.getCurrentTokenRow();
                return c === -1 ? new s(t, e.getLine(t).length, p, h) : new s(p, h, t, i.getCurrentTokenColumn())
            }
        }.call(u.prototype)
}), define("ace/mode/microscript", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/microscript_highlight_rules", "ace/mode/folding/microscript", "ace/range", "ace/worker/worker_client"], function(e, t, n) {
    "use strict";
    var r = e("../lib/oop"),
        i = e("./text").Mode,
        s = e("./microscript_highlight_rules").MicroscriptHighlightRules,
        o = e("./folding/microscript").FoldMode,
        u = e("../range").Range,
        a = e("../worker/worker_client").WorkerClient,
        f = function() {
            this.HighlightRules = s, this.foldingRules = new o, this.$behaviour = this.$defaultBehaviour
        };
    r.inherits(f, i),
        function() {
            function n(t) {
                var n = 0;
                for (var r = 0; r < t.length; r++) {
                    var i = t[r];
                    i.type == "keyword" ? i.value in e && (n += e[i.value]) : i.type == "paren.lparen" ? n += i.value.length : i.type == "paren.rparen" && (n -= i.value.length)
                }
                return n < 0 ? -1 : n > 0 ? 1 : 0
            }
            this.lineCommentStart = "//", this.blockComment = {
                start: "//",
                end: "\n"
            };
            var e = {
                    "function": 1,
                    "then": 1,
                    "else": 1,
                    "elsif": 1,
                    "while": 1,
                    "end": -1,
                    "for": 1,
                    "object": 1,
                    "class": 1
                },
                t = ["else", "elsif", "end"];
            this.getNextLineIndent = function(e, t, r) {
                var i = this.$getIndent(t),
                    s = 0,
                    o = this.getTokenizer().getLineTokens(t, e),
                    u = o.tokens;
                return e == "start" && (s = n(u)), s > 0 ? i + r : s < 0 && i.substr(i.length - r.length) == r && !this.checkOutdent(e, t, "\n") ? i.substr(0, i.length - r.length) : i
            }, this.checkOutdent = function(e, n, r) {
                if (r != "\n" && r != "\r" && r != "\r\n") return !1;
                if (n.match(/^\s*[\)\}\]]$/)) return !0;
                var i = this.getTokenizer().getLineTokens(n.trim(), e).tokens;
                return !i || !i.length ? !1 : i[0].type == "keyword" && t.indexOf(i[0].value) != -1
            }, this.getMatching = function(t, n, r) {
                if (n == undefined) {
                    var i = t.selection.lead;
                    r = i.column, n = i.row
                }
                var s = t.getTokenAt(n, r);
                if (s && s.value in e) return this.foldingRules.microscriptBlock(t, n, r, !0)
            }, this.autoOutdent = function(e, t, n) {
                var r = t.getLine(n),
                    i = r.match(/^\s*/)[0].length;
                if (!i || !n) return;
                var s = this.getMatching(t, n, i + 1);
                if (!s || s.start.row == n) return;
                var o = this.$getIndent(t.getLine(s.start.row));
                o.length != i && (t.replace(new u(n, 0, n, i), o), t.outdentRows(new u(n + 1, 0, n + 1, 0)))
            }, this.createWorker = function(e) {
                var t = new a(["ace"], "ace/mode/microscript_worker", "Worker");
                return t.attachToDocument(e.getDocument()), t.on("annotate", function(t) {
                    e.setAnnotations(t.data)
                }), t.on("terminate", function() {
                    e.clearAnnotations()
                }), t
            }, this.$id = "ace/mode/microscript"
        }.call(f.prototype), t.Mode = f
});
(function() {
    window.require(["ace/mode/microscript"], function(m) {
        if (typeof module == "object" && typeof exports == "object" && module) {
            module.exports = m;
        }
    });
})();
