export function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Retail%20Bandhu%20Icon-UTC7N2g2VekiBnTd3BPQpxy6SJtc59.png"
              alt="Retail Bandhu"
              className="h-8 w-8 rounded-md"
            />
            <span className="font-semibold">Retail Bandhu</span>
          </div>
          <p className="text-sm text-slate-600">Digitizing India’s FMCG supply chain.</p>
          <div className="mt-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Your%20paragraph%20text%281%29-79vwxa9s8YJrBXoMPbyTOtxQa0dcri.png"
              alt="Retail Bandhu banner"
              className="w-full max-w-xs rounded"
            />
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-semibold">Contact</h4>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>Address: E 16 Shiv Vihar Modinagar, Ghaziabad U.P 201204</li>
            <li>Phone: +91 7417979002, +91 8171169007</li>
            <li>Email: retailbandhu@gmail.com</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-semibold">Quick Links</h4>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>
              <a href="/features" className="hover:underline">
                Features
              </a>
            </li>
            <li>
              <a href="/products" className="hover:underline">
                Products
              </a>
            </li>
            <li>
              <a href="/company/about" className="hover:underline">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Retail Bandhu. All rights reserved.</span>
          <span>Made with ❤️ in India</span>
        </div>
      </div>
    </footer>
  )
}
