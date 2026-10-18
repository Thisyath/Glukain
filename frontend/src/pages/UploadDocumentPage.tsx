import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsApi } from '../api/documents';

export default function UploadDocumentPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [checkupDate, setCheckupDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (selectedFile: File) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(selectedFile.type)) {
      setError('Format tidak didukung, gunakan JPG/PNG/PDF.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File terlalu besar, maksimal 10 MB.');
      return;
    }

    setFile(selectedFile);
    setError('');

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await documentsApi.upload(file, checkupDate || undefined);
      navigate(`/processing/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Unggah gagal, coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <p className="text-primary-600 text-[13px] font-bold mb-2">S-07 - UNGGAH DOKUMEN</p>
        <h1 className="text-[28px] font-bold text-neutral-900 leading-9 mb-2">Unggah Dokumen</h1>
        <p className="text-neutral-500 text-base leading-6">Foto atau PDF hasil pemeriksaan dokter</p>
      </div>

      {error && (
        <div className="p-3 rounded-input bg-danger-100 text-danger-600 text-sm mb-4">{error}</div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          dragActive ? 'border-primary-600 bg-primary-600/5' : 'border-neutral-500/30'
        }`}
      >
        {preview ? (
          <div className="space-y-4">
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
            <p className="text-sm text-neutral-500">{file?.name}</p>
          </div>
        ) : file ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary-600/10 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-neutral-500">{file.name}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface-50 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-neutral-900 font-medium">Seret & letakkan file di sini</p>
              <p className="text-sm text-neutral-500">JPG, PNG, PDF - maks 10 MB</p>
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-sm">
              Pilih File
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />
      </div>

      <div className="mt-4 p-4 bg-surface-50 rounded-xl">
        <p className="text-sm font-medium text-neutral-900 mb-2">Tips foto yang baik:</p>
        <ul className="text-sm text-neutral-500 space-y-1">
          <li>Pencahayaan cukup, tidak buram</li>
          <li>Seluruh halaman terlihat jelas</li>
          <li>Teks dapat dibaca</li>
        </ul>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-neutral-900 mb-2">Tanggal Pemeriksaan (opsional)</label>
        <input
          type="date"
          value={checkupDate}
          onChange={(e) => setCheckupDate(e.target.value)}
          className="input-field"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || isLoading}
        className="btn-primary w-full mt-6"
      >
        {isLoading ? 'Mengunggah...' : 'Unggah'}
      </button>
    </div>
  );
}
