// declare module '*.module.scss' {
//     const content: Record<string, string>;
//     export default content;
// }

// import { APP_TYPE } from "./types/app/app-type";


declare module '*.module.scss' {
  interface IClassNames {
    [className: string]: string
  }
  const classNames: IClassNames;
  export = classNames;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module "*.svg" {
  import React from "react";
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare const __APP__: 'callings' | 'documents' | 'report';
declare const __IN_BITRIX__: boolean;
declare const __ENV__: 'production' | 'development';
declare const __IS_PROD__: boolean;
declare const __ONLINE_API_KEY__: string;
declare const __SERVER__: string;




