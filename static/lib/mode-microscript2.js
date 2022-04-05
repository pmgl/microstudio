//
// See doc: https://github.com/ajaxorg/ace/wiki/Creating-or-Extending-an-Edit-Mode#minimal-new-mode
//


define('ace/mode/microscript2', function(require, exports, module) {

var oop = require("ace/lib/oop");
var TextMode = require("ace/mode/text").Mode;
var Microscript2HighlightRules = require("ace/mode/microscript2_highlight_rules").Microscript2HighlightRules;









var BaseFoldMode = require("ace/mode/folding/fold_mode").FoldMode;
var Range = require("ace/range").Range;
var TokenIterator = require("ace/token_iterator").TokenIterator;
var FoldMode = exports.FoldMode = function() {};

oop.inherits(FoldMode, BaseFoldMode);

(function() {

    this.foldingStartMarker = /\b(function|then|do|object|class|for|while)\b|{\s*$|(\[=*\[)/;
    this.foldingStopMarker = /\bend\b|^\s*}|\]=*\]/;

    this.getFoldWidget = function(session, foldStyle, row) {
        var line = session.getLine(row);
        var isStart = this.foldingStartMarker.test(line);
        var isEnd = this.foldingStopMarker.test(line);

        if (isStart && !isEnd) {
            var match = line.match(this.foldingStartMarker);
            if (match[1] == "then" && /\belsif\b/.test(line))
                return;
            if (match[1]) {
                if (session.getTokenAt(row, match.index + 1).type === "keyword")
                    return "start";
            } else if (match[2]) {
                var type = session.bgTokenizer.getState(row) || "";
                if (type[0] == "bracketedComment" || type[0] == "bracketedString")
                    return "start";
            } else {
                return "start";
            }
        }
        if (foldStyle != "markbeginend" || !isEnd || isStart && isEnd)
            return "";

        var match = line.match(this.foldingStopMarker);
        if (match[0] === "end") {
            if (session.getTokenAt(row, match.index + 1).type === "keyword")
                return "end";
        } else if (match[0][0] === "]") {
            var type = session.bgTokenizer.getState(row - 1) || "";
            if (type[0] == "bracketedComment" || type[0] == "bracketedString")
                return "end";
        } else
            return "end";
    };

    this.getFoldWidgetRange = function(session, foldStyle, row) {
        var line = session.doc.getLine(row);
        var match = this.foldingStartMarker.exec(line);
        if (match) {
            if (match[1])
                return this.microscriptBlock(session, row, match.index + 1);

            if (match[2])
                return session.getCommentFoldRange(row, match.index + 1);

            return this.openingBracketBlock(session, "{", row, match.index);
        }

        var match = this.foldingStopMarker.exec(line);
        if (match) {
            if (match[0] === "end") {
                if (session.getTokenAt(row, match.index + 1).type === "keyword")
                    return this.microscriptBlock(session, row, match.index + 1);
            }

            if (match[0][0] === "]")
                return session.getCommentFoldRange(row, match.index + 1);

            return this.closingBracketBlock(session, "}", row, match.index + match[0].length);
        }
    };

    this.microscriptBlock = function(session, row, column, tokenRange) {
        var stream = new TokenIterator(session, row, column);
        var indentKeywords = {
            "function": 1,
            "do": 1,
            "then": 1,
            "for": 1,
            "while": 1,
            "object": 1,
            "class": 1,
            "elsif": -1,
            "end": -1
        };

        var token = stream.getCurrentToken();
        if (!token || token.type != "keyword")
            return;

        var val = token.value;
        var stack = [val];
        var dir = indentKeywords[val];

        if (!dir)
            return;

        var startColumn = dir === -1 ? stream.getCurrentTokenColumn() : session.getLine(row).length;
        var startRow = row;

        stream.step = dir === -1 ? stream.stepBackward : stream.stepForward;
        while(token = stream.step()) {
            if (token.type !== "keyword")
                continue;
            var level = dir * indentKeywords[token.value];

            if (level > 0) {
                stack.unshift(token.value);
            } else if (level <= 0) {
                stack.shift();
                if (!stack.length && token.value != "elsif")
                    break;
                if (level === 0)
                    stack.unshift(token.value);
            }
        }

        if (!token)
            return null;

        if (tokenRange)
            return stream.getCurrentTokenRange();

        var row = stream.getCurrentTokenRow();
        if (dir === -1)
            return new Range(row, session.getLine(row).length, startRow, startColumn);
        else
            return new Range(startRow, startColumn, row, stream.getCurrentTokenColumn());
    };

}).call(FoldMode.prototype);









var Mode = function() {
    this.HighlightRules = Microscript2HighlightRules;
    this.foldingRules = new FoldMode() ;
};
oop.inherits(Mode, TextMode);



(function() {

  this.lineCommentStart = "//";
  this.blockComment = {start: "/*", end: "*/"};

  var indentKeywords = {
      "function": 1,
      "then": 1,
      "do": 1,
      "else": 1,
      "elsif": 1,
      "while": 1,
      "for": 1,
      "object": 1,
      "class": 1,
      "end": -1
  };

  var outdentKeywords = [
      "else",
      "elsif",
      "end"
  ];

  function getNetIndentLevel(tokens) {
      var level = 0;
      // Support single-line blocks by decrementing the indent level if
      // an ending token is found
      for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];
          if (token.type == "keyword") {
              if (token.value in indentKeywords) {
                  level += indentKeywords[token.value];
              }
          } else if (token.type == "paren.lparen") {
              level += token.value.length;
          } else if (token.type == "paren.rparen") {
              level -= token.value.length;
          }
      }
      // Limit the level to +/- 1 since usually users only indent one level
      // at a time regardless of the logical nesting level
      if (level < 0) {
          return -1;
      } else if (level > 0) {
          return 1;
      } else {
          return 0;
      }
  }

  this.getNextLineIndent = function(state, line, tab) {
      var indent = this.$getIndent(line);
      var level = 0;

      var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
      var tokens = tokenizedLine.tokens;

      if (state == "start") {
          level = getNetIndentLevel(tokens);
      }
      if (level > 0) {
          return indent + tab;
      } else if (level < 0 && indent.substr(indent.length - tab.length) == tab) {
          // Don't do a next-line outdent if we're going to do a real outdent of this line
          if (!this.checkOutdent(state, line, "\n")) {
              return indent.substr(0, indent.length - tab.length);
          }
      }
      return indent;
  };

  this.checkOutdent = function(state, line, input) {
      if (input != "\n" && input != "\r" && input != "\r\n")
          return false;

      if (line.match(/^\s*[\)\}\]]$/))
          return true;

      var tokens = this.getTokenizer().getLineTokens(line.trim(), state).tokens;

      if (!tokens || !tokens.length)
          return false;

      return (tokens[0].type == "keyword" && outdentKeywords.indexOf(tokens[0].value) != -1);
  };

  this.getMatching = function(session, row, column) {
      if (row == undefined) {
          var pos = session.selection.lead;
          column = pos.column;
          row = pos.row;
      }

      var startToken = session.getTokenAt(row, column);
      if (startToken && startToken.value in indentKeywords)
          return this.foldingRules.microscriptBlock(session, row, column, true);
  };

  this.autoOutdent = function(state, session, row) {
      var line = session.getLine(row);
      var column = line.match(/^\s*/)[0].length;
      if (!column || !row) return;

      var startRange = this.getMatching(session, row, column + 1);
      if (!startRange || startRange.start.row == row)
           return;
      var indent = this.$getIndent(session.getLine(startRange.start.row));
      if (indent.length != column) {
          session.replace(new Range(row, 0, row, column), indent);
          session.outdentRows(new Range(row + 1, 0, row + 1, 0));
      }
  };



}).call(Mode.prototype);

exports.Mode = Mode;
});

define('ace/mode/microscript2_highlight_rules', function(require, exports, module) {

var oop = require("ace/lib/oop");
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

var Microscript2HighlightRules = function() {

  var mapper = this.createKeywordMapper({
      keyword: "do|after|every|sleep|else|elsif|end|function|if|in|to|local|then|or|and|not|object|class|extends|new|constructor",
      "keyword.control": "for|by|return|while|break|continue",
      "support.function": "print|time|type|log|max|PI|pow|random|ceil|round|floor|abs|sqrt|min|exp|sin|atan|concat|sortList|cos|sin|tan|acos|asin|atan|atan2|sind|cosd|tand|acosd|asind|atand|atan2d",
      "support.function": "screen|system|audio|gamepad|keyboard|touch|mouse|storage|asset_manager",
      "support.constant": "true|false|PI",
      "variable.language": "this|type|super"
    },"identifier") ;

  this.$rules = {
      start: [{
          token: "comment.line",
          regex: "\\/\\/.*$"
      }, {
          token : "comment.block", // multi line comment
          regex : "\\/\\*",
          next : "comment"
      },{
          token : "string", // multi line string
          regex : '"',
          next : "doublequotestr"
      }, {
          token : "string", // multi line string
          regex : "'",
          next : "singlequotestr"
      },{
          token : "constant.numeric", // hex number
          regex : "0x[a-fA-F0-9]+"
      },{
          token : "constant.numeric", // decimal integers and floats
          regex : /(?:\d\d*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+\b)?/
      }, {
          token: mapper,
          regex: "[a-zA-Z][a-zA-Z0-9_]*\\b"
      }, {
          token: "string",
          regex: '"(?:[^"])*"'
      }, {
          token: "string",
          regex: "'(?:[^\\\\]|\\\\.)*?'"
      }, {
          token: "keyword.operator",
          regex: "\\+|\\-|\\*|\\/|%|&|\\||\\^|<|>|<=|=>|==|=|&=|\\|="
      }, {
          token: "paren.lparen",
          regex: "[\\[\\(]"
      }, {
          token: "paren.rparen",
          regex: "[\\]\\)]"
      }, {
          token: "text",
          regex: "\\s+|\\w+"
      }],
    comment: [ {
          token : "comment", // closing comment
          regex : "\\*\\/",
          next : "start"
        }, {
            defaultToken : "comment"
        }
      ],
      doublequotestr: [ {
            token : "comment.character.escape", // embedded quote
            regex : '""|\\\\"|\\\\\\\\',
          },{
                token : "comment.character.escape",
                regex : '\\\\n',
          },{
            token : "string", // closing string
            regex : '"',
            next : "start"
          }, {
              defaultToken : "string"
          }
        ],
        singlequotestr: [ {
              token : "comment.character.escape", // embedded quote
              regex : "''|\\\\'|\\\\\\\\",
            },{
                  token : "comment.character.escape",
                  regex : '\\\\n',
            },{
              token : "string", // closing string
              regex : "'",
              next : "start"
            }, {
                defaultToken : "string"
            }
          ]
  }
}

oop.inherits(Microscript2HighlightRules, TextHighlightRules);

exports.Microscript2HighlightRules = Microscript2HighlightRules;
});
