import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, RotateCw } from 'lucide-react';
import { uploadApplicationDocument } from '../../lib/supabase/storage';

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function FileUpload({
  label,
  accept = '*',
  optional = false,
  files = [],
  onFilesChange,
  draftId,
  docKey,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const runUpload = async (entryId, file) => {
    try {
      const { path } = await uploadApplicationDocument(file, draftId, docKey);
      onFilesChange((current) =>
        current.map((f) => (f.id === entryId ? { ...f, status: 'done', path, _file: undefined } : f))
      );
    } catch (err) {
      onFilesChange((current) =>
        current.map((f) =>
          f.id === entryId ? { ...f, status: 'error', error: err.message || 'Upload failed' } : f
        )
      );
    }
  };

  const handleFiles = (fileList) => {
    const newEntries = Array.from(fileList).map((file) => ({
      id: generateId(),
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploading',
      _file: file,
    }));

    onFilesChange((current) => [...current, ...newEntries]);
    newEntries.forEach((entry) => runUpload(entry.id, entry._file));
  };

  const retryUpload = (entry) => {
    if (!entry._file) return;
    onFilesChange((current) =>
      current.map((f) => (f.id === entry.id ? { ...f, status: 'uploading', error: undefined } : f))
    );
    runUpload(entry.id, entry._file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (id) => {
    onFilesChange((current) => current.filter((f) => f.id !== id));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <p className="font-body text-sm font-semibold text-navy-900">
        {label}
        {optional && <span className="ml-1 font-body text-xs font-normal text-navy-400">(optional)</span>}
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-1 ${
          isDragging
            ? 'border-gold-500 bg-gold-500/10'
            : 'border-navy-100 bg-cream hover:border-gold-300 hover:bg-white'
        }`}
      >
        <UploadCloud size={28} className="text-gold-500" aria-hidden="true" />
        <p className="font-body text-sm font-medium text-navy-900">
          Drag &amp; drop or <span className="text-gold-600 underline">browse</span>
        </p>
        <p className="font-body text-xs text-navy-400">
          {accept === '*' ? 'Any file type' : accept.replace(/,/g, ', ')}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files.length > 0) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2"
          >
            {files.map((file) => (
              <motion.li
                key={file.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 ${
                  file.status === 'error' ? 'border-red-200' : 'border-navy-100'
                }`}
              >
                <FileText size={18} className="flex-shrink-0 text-navy-300" aria-hidden="true" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-body text-sm font-medium text-navy-900">{file.name}</p>
                  {file.status === 'error' ? (
                    <p className="font-body text-xs text-red-600">{file.error || 'Upload failed'}</p>
                  ) : (
                    <p className="font-body text-xs text-navy-400">{formatSize(file.size)}</p>
                  )}

                  {file.status === 'uploading' && (
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-navy-100">
                      <motion.div
                        className="h-full w-1/3 rounded-full bg-gold-500"
                        animate={{ x: ['-100%', '300%'] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  )}
                </div>

                {file.status === 'done' && (
                  <CheckCircle2 size={18} className="flex-shrink-0 text-green-500" aria-hidden="true" />
                )}

                {file.status === 'error' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      retryUpload(file);
                    }}
                    className="flex flex-shrink-0 items-center gap-1 rounded-lg px-2 py-1 font-body text-xs font-semibold text-gold-600 transition-colors hover:bg-gold-500/10"
                  >
                    <RotateCw size={14} aria-hidden="true" />
                    Retry
                  </button>
                )}

                {file.status === 'error' && (
                  <AlertCircle size={18} className="flex-shrink-0 text-red-500" aria-hidden="true" />
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={16} />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}