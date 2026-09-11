import Link from "next/link";

export function LicenseNotice() {
  return (
    <aside aria-label="Software license" className="my-6 rounded-lg border bg-muted/30 p-4 text-sm leading-6">
      <p className="font-semibold">Your blog. Your content. Keep the credit.</p>
      <p className="mt-1 text-muted-foreground">
        Personal and business blogs are allowed with a visible
        {" "}<a href="https://nextjsblog.com" className="underline underline-offset-4">Powered by nextjsblog.com</a>
        {" "}footer link on every public blog page. Reselling, white-labeling or offering
        this software or derivatives as a commercial product or service is prohibited,
        even with attribution.
      </p>
      <Link href="/terms" className="mt-2 inline-block font-medium underline underline-offset-4">Read the terms & license</Link>
    </aside>
  );
}
