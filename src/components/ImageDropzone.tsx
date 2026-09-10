import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");

export function ImageDropzone({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files can be uploaded.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10 MB.");
      return;
    }
    setError("");
    setBusy(true);
    const path = `${Date.now()}-${slug(file.name) || "photo.jpg"}`;
    const { error: upErr } = await supabase.storage
      .from("menu")
      .upload(path, file, { contentType: file.type, upsert: false });
    setBusy(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    onChange(`/api/public/menu-image/${path}`);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void upload(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          over ? "border-primary bg-primary/5" : "border-border bg-muted/40"
        }`}
      >
        <UploadCloud className="size-6 text-muted-foreground" />
        <p className="mt-2 text-sm font-semibold">
          {busy ? "Uploading…" : "Drag a photo here, or click to choose"}
        </p>
        <p className="text-xs text-muted-foreground">JPG / PNG / WebP, up to 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void upload(e.target.files?.[0])}
        />
      </div>

      {error && <p className="mt-2 text-sm font-semibold text-destructive">{error}</p>}

      {value && (
        <img src={value} alt="" className="mt-3 h-32 w-full rounded-2xl object-cover" />
      )}
    </div>
  );
}
