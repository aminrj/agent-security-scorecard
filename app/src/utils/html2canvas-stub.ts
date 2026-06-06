// Stub for html2canvas — jsPDF's optional .html() method references it
// dynamically. We only use jsPDF's raw drawing API, so this stub is never
// actually called. It exists solely to prevent Vite from bundling the real
// html2canvas package (199KB gzip).
export default function html2canvas() {
  throw new Error('html2canvas is not available in this build');
}
