export interface LatexVariable {
  name: string;
  description: string;
}

export interface LatexBlockData {
  text: string;
  inlineStyles: any[];
  latex: string;
  variables: LatexVariable[];
}

