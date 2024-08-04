import Markdown from "react-markdown";
import supersub from "remark-supersub";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { useToast } from "./ui/use-toast";
import Cookies from "js-cookie";

export interface DataType {
  saves: string;
  formula: string;
  onRerender: () => void;
}

const HistoryRow = ({ saves, formula, onRerender }: DataType) => {
  const { toast } = useToast();
  const copyToClipboard = () => {
    toast({
      title: "Result Copied",
    });
    navigator.clipboard.writeText(saves);
  };

  const handleDelete = () => {
    let formulaCookies = Cookies.get()["formula"].split(",");
    let formulaValues = Cookies.get()["saves"].split(",");

    let index = formulaCookies.indexOf(formula);

    let deleteFormula = formulaCookies[index];
    let deleteValue = formulaValues[index];

    Cookies.set(
      "formula",
      formulaCookies.filter((x) => x != deleteFormula).join(",")
    );
    Cookies.set(
      "saves",
      formulaValues.filter((x) => x != deleteValue).join(",")
    );

    onRerender();
  };

  return (
    <div className="flex flex-row border-black border-t-2 w-full justify-end">
      <div className="flex flex-col w-full pt-3">
        <Markdown
          remarkPlugins={[
            [remarkGfm, { singleTilde: false }],
            remarkMath,
            supersub,
          ]}
          className="font-semibold text-2xl ml-4"
        >
          {formula}
        </Markdown>
        <h1 className="font-normal text-2xl ml-4 pb-3">{saves}</h1>
      </div>
      <div className="flex flex-col sm:flex-row justify-evenly">
        <button
          onClick={copyToClipboard}
          className="bg-button_2 sm:h-[50%] self-center text-center text-white px-3 py-2 rounded-xl mr-5 h-10"
        >
          <h1 className="text-center pb-10">Copy</h1>
        </button>
        <button
          onClick={handleDelete}
          className="bg-red sm:h-[50%] self-center text-center text-white px-3 py-2 rounded-xl mr-5 h-10"
        >
          <h1 className="text-center pb-10">Delete</h1>
        </button>
      </div>
    </div>
  );
};

export default HistoryRow;
