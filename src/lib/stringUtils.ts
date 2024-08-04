import { extractNum } from "./calculationUtils";
import { checkUpperCase } from "./utils";

const checkIsNumber = (character: string) => {
  if (character >= "0" && character <= "9") {
    return true;
  }
  return false;
};
const convertToSubscript = (text: string, isNotFirst: boolean = false) => {
  if (isNotFirst) {
    return text.replace(/(.)/g, "$1~");
  }
  return text.replace(/(.)/g, "~$1~");
};

const multiplyWithinParentheses = (str: string, multiplier: number) => {
  return str.replace(/\(([^()]*)\)/g, (match, group) => {
    console.log(match);
    return `(${group.replace(/(\d+)/g, (match: any) => {
      return parseInt(match) * multiplier;
    })})`;
  });
};

export const removeParentheses = (text: string | undefined) => {
  const countParenthesesRegex = /\)/g;
  if (text!.match(countParenthesesRegex)?.length == 1) {
    //Edge Case
    let afterParentheses = text!.match(/\)[\s\S]*/);
    let multiplier: any = "";
    if (afterParentheses) {
      for (let i = 1; i < afterParentheses[0].length; i++) {
        //skip parentheses
        if (afterParentheses[0][i].match(/[0-9]/)) {
          multiplier += afterParentheses[0][i];
        }
      }
      multiplier = multiplier == "" ? 1 : multiplier;

      return multiplyWithinParentheses(text!, multiplier);
    }
  }

  const regex = /\(([^)]+)\)(\d+)/g;

  // Function to multiply the elements inside the parentheses with the number outside
  const multiplyElements = (p1: string | undefined, p2: string): string => {
    const multiplier = parseInt(p2);
    let result = "";

    // Check if there are nested parentheses
    if (p1!.includes("(")) {
      p1 = removeParentheses(p1!);
    }

    for (let i = 0; i < p1!.length; i++) {
      const char = p1![i];
      if (char.match(/[A-Z]/)) {
        let count: any = "";
        while (p1![i + 1] && p1![i + 1].match(/\d/)) {
          count += p1![i + 1];
          i++;
        }
        count = count ? parseInt(count) : 1;
        result += char + count * multiplier;
      } else if (char.match(/[a-z]/)) {
        result += char;
      } else if (char.match(/\d/)) {
        continue;
      } else {
        result += char;
      }
    }

    return result;
  };

  // Recursively replace parentheses with the multiplied elements
  while (text!.match(regex)) {
    text = text!.replace(regex, multiplyElements);
  }

  return text;
};

export const textToArray = (text: string, addTrailing: boolean = false) => {
  let start = 0;

  let elements: string[] = [];
  if (text != undefined) {
    for (let i = 0; i < text.length; i++) {
      if (checkIsNumber(text.charAt(i))) {
        // Check is number (convert to subscript)
        let isNotFirst = text.charAt(i - 1) == "~";
        if (isNotFirst) {
          // Check for first to prevent two tildas
          text =
            text.substring(0, i - 1) +
            convertToSubscript(text.charAt(i), isNotFirst) +
            text.substring(i + 1);
        } else {
          text =
            text.substring(0, i) +
            convertToSubscript(text.charAt(i), isNotFirst) +
            text.substring(i + 1);
          i += 2;
        }
      } else if (checkUpperCase(text.charAt(i))) {
        // If upper case label previous as one element
        let ele = text.substring(start, i);
        if (addTrailing) {
          if (!extractNum(ele)[0] && ele != "" && ele.match(/[A-z]/)) {
            ele += "~1~";
          }
        }

        elements.push(ele);
        start = i;
      }
    }
  }
  return elements;
};
