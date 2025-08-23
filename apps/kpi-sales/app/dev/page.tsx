"use client";

import App from "@/modules/app/ui/App";

export default function ReportPage() {
  const inBitrix = process.env.IN_BITRIX as string | boolean | undefined;
  console.log("1420 dev page");
  return <App inBitrix={false} envBitrix={inBitrix} />;
}
