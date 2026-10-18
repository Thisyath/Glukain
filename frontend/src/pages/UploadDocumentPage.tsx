import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsApi } from '../api/documents';
import InfoAlert from '../components/InfoAlert';
import PageHeading from '../components/PageHeading';
import Button from '../components/Button';
import { Icon, type IconName } from '../components/icons';
import { fileTypeLabel, formatBytes } from '../lib/format';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024;

const GUIDANCE: Array<{ icon: IconName; title: string; description: string }> = [
  { icon: 'sun', title: 'Cahaya cukup', description: 'Hindari bayangan dan pantulan lampu.' },
  { icon: 'focus', title: 'Tidak buram', description: 'Pegang kamera stabil dan fokuskan teks.' },
  {
    icon: 'file-text',
    title: 'Seluruh halaman terlihat',
    description: 'Jangan memotong nama pemeriksaan atau satuan.',
  },
];

export default function UploadDocumentPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleFile = (selectedFile: File) => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Format tidak didukung, gunakan JPG/PNG/PDF.');
      resetFile();
      return;
    }
    if (selectedFile.size > MAX_SIZE) {
      setError('File terlalu besar, maksimal 10 MB.');
      resetFile();
      return;
    }

    setError('');
    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      // Tanggal pemeriksaan diisi pengguna di layar konfirmasi.
      const result = await documentsApi.upload(file);
      navigate(`/processing/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Unggah gagal, coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeading
        title="Unggah dokumen dokter"
        subtitle="Gunakan hasil pemeriksaan atau resep. Kami bantu membaca nilainya; Anda tetap meninjau hasilnya."
      />

      {error && (
        <div role="alert" className="rounded-control bg-danger-100 p-4 text-sm text-danger-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,648px)_320px]">
        <div className="space-y-6">
          <section className="card space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">Tambahkan dokumen</h2>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex min-h-[258px] flex-col items-center justify-center gap-6 rounded-control border border-dashed p-6 text-center transition-colors ${
                dragActive ? 'border-primary-600 bg-primary-600/5' : 'border-primary-600 bg-surface-50'
              }`}
            >
              <Icon name="cloud-upload" size={48} className="text-primary-600" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-neutral-900">
                  Tarik file ke sini, atau pilih dari perangkat
                </p>
                <p className="text-[13px] text-neutral-500">
                  JPG / PNG / PDF • Maksimal 10 MB per file
                </p>
              </div>
              <Button
                variant="secondary"
                icon="folder-open"
                onClick={() => fileInputRef.current?.click()}
              >
                Pilih file
              </Button>
            </div>

            <Button variant="ghost" icon="camera" onClick={() => cameraInputRef.current?.click()}>
              Foto langsung
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(event) => event.target.files?.[0] && handleFile(event.target.files[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => event.target.files?.[0] && handleFile(event.target.files[0])}
            />
          </section>

          <section className="card space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">Pratinjau dokumen</h2>

            {file ? (
              <div className="flex items-center gap-4 border-y border-neutral-500/10 py-2">
                {preview ? (
                  <img
                    src={preview}
                    alt={`Pratinjau ${file.name}`}
                    className="h-12 w-12 shrink-0 rounded-control object-cover"
                  />
                ) : (
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-surface-50 text-neutral-500">
                    <Icon name="file-text" size={24} />
                  </span>
                )}

                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-base font-semibold text-neutral-900">{file.name}</p>
                  <p className="text-[13px] text-neutral-500">
                    {fileTypeLabel(file.type)} • {formatBytes(file.size)} • Siap diunggah
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetFile}
                  className="shrink-0 text-[13px] font-medium text-primary-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <p className="border-y border-neutral-500/10 py-2 text-base text-neutral-500">
                Belum ada file dipilih. File yang Anda pilih akan tampil di sini.
              </p>
            )}

            <Button icon="upload" onClick={handleUpload} disabled={!file} loading={isLoading}>
              Unggah
            </Button>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">Agar hasil terbaca jelas</h2>

            <ul>
              {GUIDANCE.map((item) => (
                <li
                  key={item.title}
                  className="flex items-center gap-4 border-b border-neutral-500/10 py-3 last:border-b-0"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-surface-50 text-primary-600">
                    <Icon name={item.icon} size={24} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-neutral-900">
                      {item.title}
                    </span>
                    <span className="block text-[13px] leading-5 text-neutral-500">
                      {item.description}
                    </span>
                  </span>
                  <Icon name="chevron-right" size={20} className="shrink-0 text-neutral-500" />
                </li>
              ))}
            </ul>
          </section>

          <InfoAlert title="Data medis Anda privat">
            Dokumen hanya tersedia di akun Anda. Periksa dan koreksi hasil bacaan sebelum analisis
            final.
          </InfoAlert>
        </div>
      </div>
    </>
  );
}
