"use client";

import { useRouter } from "next/navigation";
import React, { Suspense } from "react";

export default function SidebarImport() {
  const router = useRouter();
  async function onChange(e) {
    const fileInput = e.target;
    // console.log(fileInput, "fileInput----------");打印出来的为input标签
    console.log(fileInput.files, "fileInput.files----------");
    if (!fileInput.files || fileInput.files.length === 0) {
      console.warn("files list is empty");
      return;
    }
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("something went wrong");
        return;
      }
      const data = await response.json();
      router.push(`/note/${data.uid}`);
      router.refresh();
    } catch (error) {
      console.error("something went wrong");
      console.error(error);
    }
    e.target.type = "text";
    e.target.type = "file";
  }
  return (
    <div style={{ textAlign: "center" }}>
      <label for="file" style={{ cursor: "pointer" }}>
        Import .md File
      </label>
      <input
        type="file"
        id="file"
        name="file"
        multiple
        style={{ position: "absolute", clip: "rect(0 0 0 0)" }}
        accept=".md"
        onChange={onChange}
      />
    </div>
  );
}
//label的for属性，关联input的id
