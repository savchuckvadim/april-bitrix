// import html2pdf from 'html2pdf.js';
// import { Button } from "@workspace/ui/components/button";

// export const DownLoadPdf = () => {
//   const handleDownload = () => {
//     const element = document.getElementById('user-report');
//     if (!element) return;

//     const options = {
//       margin:       0.5,
//       filename:     'user-report.pdf',
//       image:        { type: 'jpeg', quality: 0.98 },
//       html2canvas:  { scale: 2, useCORS: true },
//       jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
//     };

//     html2pdf().from(element).set(options).save();
//   };

//   return <Button onClick={handleDownload}>Скачать PDF</Button>;
// };
