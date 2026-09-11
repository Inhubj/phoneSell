"use client";

type PhotoPickerProps = {
  onFile: (file: File) => void | Promise<void>;
  disabled?: boolean;
};

function handleChange(
  e: React.ChangeEvent<HTMLInputElement>,
  onFile: (file: File) => void | Promise<void>,
) {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (file) void onFile(file);
}

export function PhotoPicker({ onFile, disabled }: PhotoPickerProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">
        Take photo
        <input
          type="file"
          capture="environment"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => handleChange(e, onFile)}
        />
      </label>
      <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy">
        Gallery
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => handleChange(e, onFile)}
        />
      </label>
    </div>
  );
}
