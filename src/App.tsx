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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Cookies from "js-cookie";
import HistoryRow, { DataType } from "./components/HistoryRow";
import { useToast } from "./components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { calculateMolarMass } from "./lib/calculationUtils";
import { removeParentheses, textToArray } from "./lib/stringUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { reloadCookies } from "./lib/utils";
import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";

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
    toast({
      title: "Result Copied",
    });

    navigator.clipboard.writeText(output.toFixed(6).toString());
  };

  const handleSave = () => {
    if (
      output != 0 &&
      output != undefined &&
      display != "" &&
      display != undefined
    ) {
      Cookies.set(
        "saves",
        Cookies.get()["saves"] + `,${output.toFixed(6).toString()}`
      );
      Cookies.set("formula", Cookies.get()["formula"] + `,${display}`);

      toast({
        title: "Calculation Saved",
      });
    } else {
      toast({
        title: "Failed To Save",
        variant: "destructive",
      });
    }
  };

  window.onkeydown = (ev: KeyboardEvent): any => {
    // Enter to save value
    if (ev.key === "Enter") {
      handleSave();
    }
  };

  let cookies = reloadCookies();

  const [rerender, setRerender] = useState(false);
  const handleRerender = () => {
    setRerender(!rerender);
  };

  const resetCookies = () => {
    Cookies.set("formula", "");
    Cookies.set("saves", "");
    handleRerender();
  };

  return (
    <ThemeProvider>
    <div className="bg-slate-300 dark:bg-gray-800 w-screen h-screen flex flex-col justify-evenly sm:justify-center align-top">
      <div className="flex w-full justify-center">
        <h1 className="font-extrabold text-5xl hidden text-center fixed top-20 w-fit sm:block px-3 text-button_2 dark:text-button">
          MOLAR MASS CALCULATOR
        </h1>
      </div>
<ModeToggle/>
      <Sheet>
        <SheetTrigger className="fixed left-10 top-10 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            className="size-10 sm:size-[3vh] min-size-6 stroke-black dark:stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </SheetTrigger>

        <SheetContent className="h-fit min-h-screen">
          <SheetHeader>
            <SheetTitle className="font-bold text-2xl pb-5 w-full border-b-4 border-slate-700 flex flex-col text-slate-700">
              <h1 className="ml-4">Calculation History</h1>
              <AlertDialog>
                <AlertDialogTrigger className="bg-red rounded-xl px-2 py-1 text-white mx-5 h-10 mt-5 w-[50%] self-center sm:self-start">
                  Clear All
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[90%] rounded-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-black font-semibold text-xl">
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-black">
                      This action cannot be undone. This will delete your entire
                      calculation history?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red"
                      onClick={resetCookies}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="no-scrollbar overflow-y-scroll h-screen mb-3 ">
            <div className="grid grid-cols-1 gap-3 justify-center border-b-2 border-slate-700 w-full mb-20">
              {cookies?.map((save: DataType) => (
                <HistoryRow
                  saves={save.saves}
                  formula={save.formula}
                  onRerender={handleRerender}
                />
              ))}
            </div>
          </ScrollArea>
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
            className="text-3xl text-center mb-5 text-slate-700 dark:text-white min-h-[2.25rem]"
          >
            {`${display}`}
          </Markdown>
          <input
            className="w-[80vw] bg-slate-400 dark:bg-slate-200 px-3 py-2 h-fit rounded-xl"
            type="text"
            onChange={handleChange}
          ></input>
          <div className="flex flex-col text-center sm:flex-row self-center text-slate-700 dark:text-white mt-5 text-2xl sm:text-2xl">
            <h1>{`Molar Mass:  `}</h1>
            <h1 className="ml-2 font-extrabold">{output.toFixed(6)}</h1>
            <h1 className="ml-1 hidden sm:block">grams per mole</h1>
          </div>
          <button
            onClick={handleSave}
            className="bg-button_2 dark:bg-button w-fit self-center mt-5 px-4 py-2 rounded-xl text-white dark:text-gray-900 text-xl font-bold"
          >
            <h1>Save Result</h1>
          </button>
          <button
            className="bg-button_2 dark:bg-button w-fit self-center mt-5 px-4 py-2 rounded-xl text-white dark:text-gray-900 text-xl font-bold"
            onClick={copyToClipboard}
          >
            <h1>Copy to Clipboard</h1>
          </button>
        </div>
      </div>
      <Toaster />
    </div>
    </ThemeProvider>
  );
};

export default App;
