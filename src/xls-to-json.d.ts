declare module 'xls-to-json' {
    function xlsToJson(
      options: {
        input: string;
        output: string;
        sheet: string;
        lowerCaseHeaders?: boolean;
      },
      callback: (err: Error | null, result: any) => void
    ): void;
  
    export default xlsToJson;
  }
  