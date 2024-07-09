import { auth, signIn } from "auth";
import React from "react";

async function EditNoteLayout({ children }) {
  const session = await auth();
  if (!session?.user) {
    await signIn();
  }

  return <div>{children}</div>;
}

export default EditNoteLayout;
