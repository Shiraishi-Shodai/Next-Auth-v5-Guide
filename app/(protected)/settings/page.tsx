import React from "react";
import { auth } from "@/auth";

async function SettingPage() {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
}

export default SettingPage;
