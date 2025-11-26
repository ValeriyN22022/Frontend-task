declare module 'html2canvas' {
  interface Html2CanvasOptions {
    backgroundColor?: string;
    scale?: number;
    logging?: boolean;
    width?: number;
    height?: number;
    useCORS?: boolean;
    allowTaint?: boolean;
  }

  function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions,
  ): Promise<HTMLCanvasElement>;

  export default html2canvas;
}


