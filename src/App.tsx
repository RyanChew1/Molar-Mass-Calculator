import { useState } from "react";
import "./globals.css";
import Markdown from "react-markdown";
import supersub from "remark-supersub";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
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
import { calculateMolarMass } from "./lib/calculationUtils";
import { removeParentheses, textToArray } from "./lib/stringUtils";

const App = () => {
  const { toast } = useToast();

  Cookies.set("saves", Cookies.get()["saves"]);
  Cookies.set("formula", Cookies.get()["formula"]);

  const [display, setDisplay] = useState("");
  const [output, setOutput] = useState(0);

  let elements: string[] = [];

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

    setOutput(calculateMolarMass(elements));
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
