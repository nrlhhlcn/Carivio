declare module 'html2canvas' {
  const html2canvas: any
  export default html2canvas
}

declare module 'jspdf' {
  export const jsPDF: any
}

declare module 'html-to-image' {
  export function toPng(node: HTMLElement, options?: any): Promise<string>
}

