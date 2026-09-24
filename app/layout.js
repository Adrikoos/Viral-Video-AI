import "./globals.css";

export const metadata = {
  title: "Viral Video AI",
  description: "Create AI videos from a character image and a reference video URL."
};

export default function RootLayout({ children }) {
  return <html lang="pl"><body>{children}</body></html>;
}