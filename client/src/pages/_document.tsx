import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head />
			<style>
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
			</style>
			<body className="antialiased">
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
