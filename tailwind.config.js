/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				turbo: {
					50: '#feffe7',
					100: '#faffc1',
					200: '#f9ff86',
					300: '#feff41',
					400: '#fff40d',
					500: '#ffe600',
					600: '#d1aa00',
					700: '#a67b02',
					800: '#895f0a',
					900: '#744e0f',
					950: '#442904'
				},
				'puerto-rico': {
					50: '#e5fff9',
					100: '#bdfff2',
					200: '#85ffe9',
					300: '#41fbdf',
					400: '#16dfc4',
					500: '#00b8a2',
					600: '#00998c',
					700: '#02796f',
					800: '#075f59',
					900: '#0b4c48',
					950: '#002928'
				},

				main: {
					50: '#feffe7',
					100: '#faffc1',
					200: '#f9ff86',
					300: '#feff41',
					400: '#fff40d',
					500: '#ffe600',
					600: '#d1aa00',
					700: '#a67b02',
					800: '#895f0a',
					900: '#744e0f',
					950: '#442904'
				},
				secondary: {
					50: '#f0f9fb',
					100: '#d9eff4',
					200: '#b8dfe9',
					300: '#86c7da',
					400: '#4ea7c2',
					500: '#328ba8',
					600: '#2d728f',
					700: '#2a5c74',
					800: '#2a4e60',
					900: '#274252',
					950: '#152a37'
				}
			}
		}
	},
	plugins: [require('@tailwindcss/typography')],
	darkMode: 'class'
};
