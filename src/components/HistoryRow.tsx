import Markdown from "react-markdown";
import supersub from "remark-supersub";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { useToast } from "./ui/use-toast";

export interface DataType {
  saves: string;
  formula: string;
}

const HistoryRow = ({ saves, formula }: DataType) => {
  const { toast } = useToast();
  const copyToClipboard = () => {
    toast({
      title: "Result Copied",
    });
    navigator.clipboard.writeText(saves);
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
      <button
        onClick={copyToClipboard}
        className="bg-button_2 h-[50%] self-center text-center text-white px-3 py-2 rounded-xl mr-5"
      >
        <h1 className="text-center pb-10">Copy</h1>
      </button>
    </div>
  );
};

export default HistoryRow;
