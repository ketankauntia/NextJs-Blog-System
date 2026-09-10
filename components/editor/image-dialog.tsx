"use client";

import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { IconLoader2, IconUpload } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/blog-ui/dialog";
import { Button } from "@/components/blog-ui/button";
import { Input } from "@/components/blog-ui/input";
import { Label } from "@/components/blog-ui/label";

export type ImageData = { src: string; alt: string; description: string };

/** Insert-image dialog: upload a file (dev) or paste a URL, plus alt text + description (caption). Uploads are stored per post under public/blog/<slug>/. */
export function ImageDialog({
  open,
  onOpenChange,
  onInsert,
  uploadSlug,
  canUpload = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (data: ImageData) => void;
  /** Current post slug decides the upload folder and falls back to "misc". */
  uploadSlug?: string;
  /** Hosted demos accept image URLs but cannot write uploaded files. */
  canUpload?: boolean;
}) {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setSrc("");
    setAlt("");
    setDescription("");
    setError("");
    setUploading(false);
    setDragActive(false);
  }

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      if (uploadSlug) body.append("slug", uploadSlug);
      const res = await fetch("/api/editor/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setSrc(data.path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function chooseFile(file?: File) {
    if (!file) return;
    if (!canUpload) {
      setError("Uploads are disabled in this read-only demo. Paste an image URL instead.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file such as PNG, JPG, WebP, AVIF, GIF, or SVG.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Images must be 8 MB or smaller.");
      return;
    }
    void upload(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  function handleDropzoneKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.key === "Enter" || event.key === " ") && canUpload) {
      event.preventDefault();
      fileRef.current?.click();
    }
  }

  function insert() {
    if (!src) {
      setError("Add an image by uploading a file or pasting a URL.");
      return;
    }
    if (!alt.trim()) {
      setError("Alt text is required (SEO + accessibility).");
      return;
    }
    onInsert({ src: src.trim(), alt: alt.trim(), description: description.trim() });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add image</DialogTitle>
          <DialogDescription>Upload a file or paste a URL, then describe it.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="editor-image-file">Image file</Label>
            <input
              ref={fileRef}
              id="editor-image-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
              className="hidden"
              onChange={(event) => {
                chooseFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
            <div
              role="button"
              tabIndex={canUpload ? 0 : -1}
              aria-disabled={!canUpload}
              aria-label={canUpload ? "Drop an image here or browse files" : "Image upload disabled"}
              onClick={() => canUpload && fileRef.current?.click()}
              onKeyDown={handleDropzoneKeyDown}
              onDragEnter={(event) => {
                event.preventDefault();
                if (canUpload) setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (canUpload) event.dataTransfer.dropEffect = "copy";
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragActive(false);
              }}
              onDrop={handleDrop}
              className={`flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-5 text-center transition-colors ${dragActive ? "border-primary bg-primary/10" : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40"} ${!canUpload ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
            >
              {uploading ? <IconLoader2 className="size-5 animate-spin text-primary" /> : <IconUpload className="size-5 text-muted-foreground" />}
              <p className="text-sm font-medium">{uploading ? "Uploading image…" : canUpload ? "Drop an image here or browse files" : "Image upload disabled"}</p>
              <p className="text-xs text-muted-foreground">{canUpload ? "PNG, JPG, WebP, AVIF, GIF, or SVG · 8 MB max" : "Paste an image URL below in this read-only demo"}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editor-image-url">Or image URL</Label>
            <Input
              id="editor-image-url"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="/blog/diagram.svg or https://…"
            />
          </div>

          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="max-h-40 rounded border object-contain" />
          )}

          <div className="space-y-1.5">
            <Label htmlFor="editor-image-alt">Alt text (required for SEO and screen readers)</Label>
            <Input id="editor-image-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe what the image shows" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editor-image-caption">Description or caption</Label>
            <Input
              id="editor-image-caption"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional caption readers will see"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={insert} disabled={uploading}>
            Insert image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
