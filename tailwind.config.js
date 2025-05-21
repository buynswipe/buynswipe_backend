/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#f0f7ff",
          100: "#e0eefe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#36aaf5",
          500: "#0d8de3",
          600: "#006fc1",
          700: "#015a9d",
          800: "#064b81",
          900: "#0a406c",
          950: "#07294a",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "#10b981",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        warning: {
          DEFAULT: "#f59e0b",
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        info: {
          DEFAULT: "#3b82f6",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-out-bottom": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.3s ease-out",
        "slide-out-bottom": "slide-out-bottom 0.3s ease-out",
        "pulse-slow": "pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-outfit)", "Outfit", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "65ch",
            color: "var(--tw-prose-body)",
            '[class~="lead"]': {
              color: "var(--tw-prose-lead)",
            },
            a: {
              color: "var(--tw-prose-links)",
              textDecoration: "underline",
              fontWeight: "500",
            },
            strong: {
              color: "var(--tw-prose-bold)",
              fontWeight: "600",
            },
            'ol[type="A"]': {
              listStyleType: "upper-alpha",
            },
            'ol[type="a"]': {
              listStyleType: "lower-alpha",
            },
            'ol[type="A" s]': {
              listStyleType: "upper-alpha",
            },
            'ol[type="a" s]': {
              listStyleType: "lower-alpha",
            },
            'ol[type="I"]': {
              listStyleType: "upper-roman",
            },
            'ol[type="i"]': {
              listStyleType: "lower-roman",
            },
            'ol[type="I" s]': {
              listStyleType: "upper-roman",
            },
            'ol[type="i" s]': {
              listStyleType: "lower-roman",
            },
            'ol[type="1"]': {
              listStyleType: "decimal",
            },
            "ol > li": {
              position: "relative",
            },
            "ul > li": {
              position: "relative",
            },
            "ul > li::marker": {
              color: "var(--tw-prose-bullets)",
            },
            "ol > li::marker": {
              color: "var(--tw-prose-counters)",
            },
            hr: {
              borderColor: "var(--tw-prose-hr)",
              borderTopWidth: 1,
            },
            blockquote: {
              fontWeight: "500",
              fontStyle: "italic",
              color: "var(--tw-prose-quotes)",
              borderLeftWidth: "0.25rem",
              borderLeftColor: "var(--tw-prose-quote-borders)",
              paddingLeft: "1em",
            },
            "blockquote p:first-of-type::before": {
              content: "open-quote",
            },
            "blockquote p:last-of-type::after": {
              content: "close-quote",
            },
            h1: {
              color: "var(--tw-prose-headings)",
              fontWeight: "800",
              fontSize: "2.25em",
              marginTop: "0",
              marginBottom: "0.8888889em",
              lineHeight: "1.1111111",
            },
            h2: {
              color: "var(--tw-prose-headings)",
              fontWeight: "700",
              fontSize: "1.5em",
              marginTop: "2em",
              marginBottom: "1em",
              lineHeight: "1.3333333",
            },
            h3: {
              color: "var(--tw-prose-headings)",
              fontWeight: "600",
              fontSize: "1.25em",
              marginTop: "1.6em",
              marginBottom: "0.6em",
              lineHeight: "1.6",
            },
            h4: {
              color: "var(--tw-prose-headings)",
              fontWeight: "600",
              marginTop: "1.5em",
              marginBottom: "0.5em",
              lineHeight: "1.5",
            },
            "figure > *": {
              margin: "0",
            },
            figcaption: {
              color: "var(--tw-prose-captions)",
              fontSize: "0.875em",
              lineHeight: "1.4285714",
              marginTop: "0.8571429em",
            },
            code: {
              color: "var(--tw-prose-code)",
              fontWeight: "600",
              fontSize: "0.875em",
            },
            "code::before": {
              content: '"`"',
            },
            "code::after": {
              content: '"`"',
            },
            "a code": {
              color: "var(--tw-prose-links)",
            },
            pre: {
              color: "var(--tw-prose-pre-code)",
              backgroundColor: "var(--tw-prose-pre-bg)",
              overflowX: "auto",
              fontWeight: "400",
              fontSize: "0.875em",
              lineHeight: "1.7142857",
              marginTop: "1.7142857em",
              marginBottom: "1.7142857em",
              borderRadius: "0.375rem",
              paddingTop: "0.8571429em",
              paddingRight: "1.1428571em",
              paddingBottom: "0.8571429em",
              paddingLeft: "1.1428571em",
            },
            "pre code": {
              backgroundColor: "transparent",
              borderWidth: "0",
              borderRadius: "0",
              padding: "0",
              fontWeight: "inherit",
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "inherit",
              lineHeight: "inherit",
            },
            "pre code::before": {
              content: "none",
            },
            "pre code::after": {
              content: "none",
            },
            table: {
              width: "100%",
              tableLayout: "auto",
              textAlign: "left",
              marginTop: "2em",
              marginBottom: "2em",
            },
            thead: {
              borderBottomWidth: "1px",
              borderBottomColor: "var(--tw-prose-th-borders)",
            },
            "thead th": {
              color: "var(--tw-prose-headings)",
              fontWeight: "600",
              verticalAlign: "bottom",
              paddingRight: "0.5714286em",
              paddingBottom: "0.5714286em",
              paddingLeft: "0.5714286em",
            },
            "thead th:first-child": {
              paddingLeft: "0",
            },
            "thead th:last-child": {
              paddingRight: "0",
            },
            "tbody tr": {
              borderBottomWidth: "1px",
              borderBottomColor: "var(--tw-prose-td-borders)",
            },
            "tbody tr:last-child": {
              borderBottomWidth: "0",
            },
            "tbody td": {
              verticalAlign: "baseline",
            },
            tfoot: {
              borderTopWidth: "1px",
              borderTopColor: "var(--tw-prose-th-borders)",
            },
            "tfoot td": {
              verticalAlign: "top",
            },
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
