import { useState } from "react";
import "./globals.css";
import Markdown from "react-markdown";
import supersub from "remark-supersub";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import elementMolarMasses from "./lib/molarMasses";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Cookies from "js-cookie";
import HistoryRow, { DataType } from "./components/HistoryRow";
import { useToast } from "./components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const App = () => {
  const { toast } = useToast();

  Cookies.set("saves", Cookies.get()["saves"]);
  Cookies.set("formula", Cookies.get()["formula"]);

  const checkUpperCase = (character: string) => {
    if (character == character.toUpperCase()) {
      return true;
    }
    return false;
  };
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
  const [display, setDisplay] = useState("");
  const [output, setOutput] = useState(0);

  let elements: string[] = [];

  const extractNum = (str: string): [string | null, string] => {
    const regex = /~([^~]+)~/;
    const match = str.match(regex);
    const num = match && match[1];
    const rest = str.replace(regex, "");
    return [num, rest];
  }

  const calculateMolarMass = () => {
    let individualMasses: number[] = [];
    for (let i = 1; i < elements.length; i++) {
      let [subScript, element]: [subScript: any, element: string] = extractNum(
        elements[i]
      ); // we will multiply element molar mass by subscript
      subScript = parseInt(subScript);
      if (checkUpperCase(elements[i][0])) {
        // Confirm starts with upper case
        let mass: number = elementMolarMasses[element];
        if (mass != undefined && subScript) {
          // check that element exists then multiply
          individualMasses.push(mass * subScript);
        } else if (mass != undefined) {
          individualMasses.push(mass);
        }
      }
    }

    let totalMass = 0;

    for (let i = 0; i < individualMasses.length; i++) {
      totalMass += individualMasses[i];
    }

    setOutput(totalMass);
  };

  const multiplyWithinParentheses = (str: string, multiplier: number) => {
    return str.replace(/\(([^()]*)\)/g, (match, group) => {
      console.log(match);
      return `(${group.replace(/(\d+)/g, (match: any) => {
        return parseInt(match) * multiplier;
      })})`;
    });
  }

  const removeParentheses = (text: string | undefined) => {
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
    }

    // Recursively replace parentheses with the multiplied elements
    while (text!.match(regex)) {
      text = text!.replace(regex, multiplyElements);
    }

    return text;
  }

  const textToArray = (text: string, addTrailing: boolean = false) => {
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

  const handleChange = (event: any) => {
    let text = event.target.value + " ";

    for (let i = 0; i < text.length - 1; i++) {
      if (text.charAt(i).match(/[A-Z]/) && text.charAt(i + 1).match(/[^0-9]/)) {
        text = text.substring(0, i + 1) + "1" + text.substring(i + 1);
        i++;
      }
    }

    let displayTextArray: string[] = textToArray(
      event.target.value + " " + " "
    );
    let displayText = displayTextArray.join("");
    elements = textToArray(removeParentheses(text)!);
    console.log(elements);
    calculateMolarMass();
    setDisplay(displayText);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output.toFixed(6).toString());
  };

  const handleSave = () => {
    toast({
      title: "Calculation Saved",
    });

    Cookies.set(
      "saves",
      Cookies.get()["saves"] + `,${output.toFixed(6).toString()}`
    );
    Cookies.set("formula", Cookies.get()["formula"] + `,${display}`);
  };

  let saveValueCookies = Array.from(
    new Set(
      Cookies.get()
        ["saves"].split(",")
        .filter((x) => x != "undefined" && x != "0.000000")
        .reverse()
    )
  );
  let saveFormulaCookies = Array.from(
    new Set(
      Cookies.get()
        ["formula"].split(",")
        .filter((x) => x != "undefined" && x != "")
        .reverse()
    )
  );

  const cookies = saveValueCookies.map((saves, i) => ({
    saves,
    formula: saveFormulaCookies[i],
  }));

  return (
    <div className="bg-gray-800 w-screen h-screen flex flex-col justify-center align-top">
      <div className="flex w-full justify-center">
        <h1 className="font-extrabold text-5xl text-center fixed top-20 w-fit  text-button">
          MOLAR MASS CALCULATOR
        </h1>
      </div>
      <Sheet>
        <SheetTrigger className=" fixed left-10 top-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="#fff"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="font-bold text-2xl ml-4">
              Calculation History
            </SheetTitle>
            <div className=" grid grid-cols-1 gap-3 justify-center pt-5 border-b-2 border-black w-full">
              {cookies?.map((save: DataType) => (
                <HistoryRow saves={save.saves} formula={save.formula} />
              ))}
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <div className="flex justify-center">
        <div className="flex flex-col justify-center">
          <Markdown
            remarkPlugins={[
              [remarkGfm, { singleTilde: false }],
              remarkMath,
              supersub,
            ]}
            className="text-3xl text-center mb-5 text-white min-h-[2.25rem]"
          >
            {`${display}`}
          </Markdown>
          <input
            className="w-[80vw] bg-slate-200 px-3 py-2 h-fit rounded-xl"
            type="text"
            onChange={handleChange}
          ></input>
          <div className="flex flex-row self-center text-white mt-5 text-2xl">
            <h1>{`Molar Mass:  `}</h1>
            <h1 className="ml-2 font-extrabold">{output.toFixed(6)}</h1>
            <h1 className="ml-1">grams per mole</h1>
          </div>
          <button
            onClick={handleSave}
            className="bg-button w-fit self-center mt-5 px-4 py-2 rounded-xl text-gray-700 text-xl font-bold"
          >
            <h1>Save Result</h1>
          </button>
          <button
            className="bg-button w-fit self-center mt-5 px-4 py-2 rounded-xl text-gray-700 text-xl font-bold"
            onClick={copyToClipboard}
          >
            <h1>Copy to Clipboard</h1>
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
