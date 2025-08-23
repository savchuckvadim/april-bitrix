// 'use client'
// import { Button } from '@workspace/ui/components/button';
// import { Upload } from 'lucide-react';
// import React, { useRef } from 'react';

// interface Props {
//   onUpload: (url: string) => void;
// }

// export const ImageUploader: React.FC<Props> = ({ onUpload }) => {
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       // Здесь можно реализовать загрузку на сервер и получить URL
//       // Пока что используем локальный URL для предпросмотра
//       const url = URL.createObjectURL(file);
//       onUpload(url);
//     }
//   };

//   return (
//     <div className='flex justify-end'>
//       <input
//         type="file"
//         ref={fileInputRef}
//         onChange={handleFileChange}
//         accept="image/*"
//         className="hidden"
//       />
//       <Button
//         onClick={() => fileInputRef.current?.click()}
//         className="mt-2 px-4 py-2 bg-foreground text-white rounded"
//       >
//         Загрузить изображение
//         <Upload />
//       </Button>
//     </div>
//   );
// };
