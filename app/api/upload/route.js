import { join } from "path";
import dayjs from "dayjs";
import { NextResponse } from "next/server";
import { stat, mkdir, writeFile } from "fs/promises";
import { addNote } from "@/lib/redis";
import mime from "mime";
import { revalidatePath } from "next/cache";

export async function POST(requrest) {
  const formData = await requrest.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const relativePath = `/uploads/${dayjs().format("YY-MM-DD")}`;
  const uploadPath = join(process.cwd(), "public", relativePath);

  try {
    await stat(uploadPath);
  } catch (e) {
    if (e.code === "ENOENT") {
      await mkdir(uploadPath, { recursive: true });
    } else {
      console.error(e);
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 }
      );
    }
  }

  try {
    const uniqueSuffix = `${Math.random().toString(36).slice(-6)}`;
    const filename = file.name.replace(/\.[^/.]+$/, "");
    const uniqueFilename = `${filename}-${uniqueSuffix}.${mime.getExtension(
      file.type
    )}`;
    await writeFile(`${uploadPath}/${uniqueFilename}`, buffer);

    const res = await addNote(
      JSON.stringify({
        title: filename,
        content: buffer.toString("utf-8"),
      })
    );

    revalidatePath("/", "layout");

    return NextResponse.json({
      fileUrl: `${relativePath}/${uniqueFilename}`,
      uid: res,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 501 }
    );
  }
}
