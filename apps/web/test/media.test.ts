import { describe, expect, it } from "vitest";
import { filePathFor, sniffImageMime, uploadDir, UploadError, MAX_UPLOAD_BYTES } from "@/lib/media";

/** Header bytes only: the sniffer must decide from magic numbers, never from a filename or
 *  a client-supplied Content-Type. */
const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]);
const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);
const webp = Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x24, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);

describe("sniffImageMime", () => {
  it("recognises the three formats the uploader accepts", () => {
    expect(sniffImageMime(jpeg)).toBe("image/jpeg");
    expect(sniffImageMime(png)).toBe("image/png");
    expect(sniffImageMime(webp)).toBe("image/webp");
  });

  it("rejects disguised and truncated files", () => {
    const php = new TextEncoder().encode("<?php system($_GET['c']); ?>");
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    const riffNotWebp = Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x41, 0x56, 0x49, 0x20]);
    expect(sniffImageMime(php)).toBeNull();
    expect(sniffImageMime(svg)).toBeNull(); // SVG is script-capable: never accepted as a photo
    expect(sniffImageMime(riffNotWebp)).toBeNull();
    expect(sniffImageMime(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });
});

describe("filePathFor", () => {
  it("resolves a server-generated key under the upload root", () => {
    const key = "inspection/8c0a1f6e-0000-4000-8000-000000000000/2f9b0c1e-0000-4000-8000-000000000000.webp";
    expect(filePathFor(key).startsWith(uploadDir())).toBe(true);
  });

  it("refuses traversal and unexpected shapes", () => {
    for (const bad of [
      "../etc/passwd",
      "inspection/../../secret.webp",
      "inspection/abc/zzzz.webp",
      "inspection/abc/xyz.png",
      "inspection/abc",
    ]) {
      expect(() => filePathFor(bad)).toThrow(UploadError);
    }
  });
});

describe("limits", () => {
  it("caps uploads at a size a phone photo can meet but a zip bomb cannot", () => {
    expect(MAX_UPLOAD_BYTES).toBe(8 * 1024 * 1024);
  });
});
