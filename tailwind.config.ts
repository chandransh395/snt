
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				travel: {
					blue: '#1A365D',
					gold: '#DBA11C',
					cream: '#F8F4E3',
					navy: '#0F172A',
					slate: '#64748B'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-in-from-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-in-from-left': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-in-from-bottom': {
					'0%': { transform: 'translateY(20%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'slide-down': 'slide-down 0.4s ease-out',
				'slide-in-right': 'slide-in-from-right 0.3s ease-out',
				'slide-in-left': 'slide-in-from-left 0.3s ease-out',
				'slide-in-bottom': 'slide-in-from-bottom 0.3s ease-out',
				'spin-slow': 'spin 3s linear infinite',
			},
			fontFamily: {
				'playfair': ['Playfair Display', 'serif'],
				'inter': ['Inter', 'sans-serif']
			},
            animationDelay: {
                100: '100ms',
                200: '200ms',
                300: '300ms',
                400: '400ms',
                500: '500ms',
            }
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({addUtilities, theme, e}) {
			const animationDelays = theme('animationDelay');
			const utilities = Object.entries(animationDelays).map(([key, value]) => {
				return {
					[`.${e(`delay-${key}`)}`]: { animationDelay: value }
				};
			});
			addUtilities(utilities);
		}
	],
} satisfies Config;
