import elementMolarMasses from "./molarMasses";
import { checkUpperCase } from "./utils";

export const extractNum = (str: string): [string | null, string] => {
  const regex = /~([^~]+)~/;
  const match = str.match(regex);
  const num = match && match[1];
  const rest = str.replace(regex, "");
  return [num, rest];
};

export const calculateMolarMass = (elements: string[]) => {
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

  return totalMass;
};
