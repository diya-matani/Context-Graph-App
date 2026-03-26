import "./globals.css";

export const metadata = {
  title: "Context Graph System",
  description: "LLM-powered query interface for SAP O2C data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
