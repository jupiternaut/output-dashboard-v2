import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { parseCSVData, parseExcelData } from '../utils';
import { ConstructionData } from '../types';

interface FileUploaderProps {
  onDataLoaded: (data: ConstructionData[], fileName: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      let data: ConstructionData[] = [];
      if (file.name.endsWith('.csv')) {
        data = await parseCSVData(file);
      } else if (file.name.match(/\.xls(x)?$/)) {
        data = await parseExcelData(file);
      } else {
        alert('不支持的文件格式，请上传 CSV 或 Excel 文件');
        setLoading(false);
        return;
      }

      onDataLoaded(data, file.name);
    } catch (error) {
      console.error('File parsing error:', error);
      alert('解析文件失败，请检查文件格式');
    } finally {
      setLoading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv, .xlsx, .xls"
      />
      <button
        onClick={handleButtonClick}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Upload size={16} />
        )}
        {loading ? '处理中...' : '导入数据'}
      </button>
    </>
  );
};

export default FileUploader;
