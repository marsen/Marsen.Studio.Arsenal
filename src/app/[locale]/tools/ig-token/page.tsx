import { Suspense } from "react";
import IgTokenGenerator from "@/presentation/components/tools/ig-token-generator";

export default function IgTokenPage() {
  return (
    <Suspense>
      <IgTokenGenerator />
    </Suspense>
  );
}
