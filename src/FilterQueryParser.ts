const parser: ExtendedParser = require("./grammar.pegjs");
import * as PEG from "pegjs";
import * as _ from "lodash";
import BaseAutoCompleteHandler from "./BaseAutoCompleteHandler";
import ParseTrace from "./ParseTrace";
import grammarUtils from "./GrammarUtils";
import { HintInfo } from "./models/ExtendedCodeMirror";
import Expression from "./Expression";
import ParsedError from "./ParsedError";

export default class FilterQueryParser {
  autoCompleteHandler = new BaseAutoCompleteHandler();
  lastError: PEG.PegjsError = null;

  parseTrace = new ParseTrace();
  constructor() {}

  parse(query: string): Expression[] | ParsedError {
    query = _.trim(query);
    if (_.isEmpty(query)) {
      return [];
    }

    try {
      const getRes = this.parseQuery(query);
      console.log("getRes :: ", getRes);

      return getRes;
    } catch (ex) {
      ex.isError = true;
      return ex;
    }
  }

  private parseQuery(query: string) {
    this.parseTrace.clear();
    return parser.parse(query, { parseTrace: this.parseTrace });
  }

  getSuggestions(query: string): HintInfo[] {
    console.log("getSuggestions :: ", query);

    query = grammarUtils.stripEndWithNonSeparatorCharacters(query);
    try {
      query = query.toString().replace("== ", "== *");
        console.log("Every Query :: ", query);
        
      this.parseQuery(query);

      if (!query || grammarUtils.isLastCharacterWhiteSpace(query)) {
        return _.map(["AND", "OR"], (f) => {
          return { value: f, type: "literal" };
        });
      }

      return [];
    } catch (ex) {
      return this.autoCompleteHandler.handleParseError(
        parser,
        this.parseTrace,
        ex
      );
    }
  }

  setAutoCompleteHandler(autoCompleteHandler: BaseAutoCompleteHandler) {
    this.autoCompleteHandler = autoCompleteHandler;
  }
}

export interface ExtendedParser extends PEG.Parser {}
