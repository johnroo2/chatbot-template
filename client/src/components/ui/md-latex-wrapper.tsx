import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import type { Plugin } from 'unified';

interface MarkdownLatexWrapperProps extends React.PropsWithChildren {
	props?: React.HTMLAttributes<HTMLDivElement>;
	remarkPlugins?: Plugin[];
	rehypePlugins?: Plugin[];
}

type ComponentProps = React.HTMLAttributes<HTMLElement> & {
	// Omitting node as it's not used
	children?: React.ReactNode;
};

export default function MarkdownLatexWrapper({
	children,
	remarkPlugins = [],
	rehypePlugins = [],
	...props
}: MarkdownLatexWrapperProps) {
	const components = {
		h1: ({ ...props }: ComponentProps) => <h1 className="text-xl font-bold py-2" {...props} />,
		h2: ({ ...props }: ComponentProps) => <h2 className="text-lg font-semibold py-2" {...props} />,
		h3: ({ ...props }: ComponentProps) => <h3 className="text-base font-semibold py-2" {...props} />,
		h4: ({ ...props }: ComponentProps) => <h4 className="text-base font-semibold py-2" {...props} />,
		h5: ({ ...props }: ComponentProps) => <h5 className="text-sm font-semibold py-2" {...props} />,
		h6: ({ ...props }: ComponentProps) => <h6 className="text-sm font-semibold py-2" {...props} />,
		ul: ({ ...props }: ComponentProps) => <ul style={{ listStyle: 'inside' }} {...props} />,
		a: ({ ...props }: ComponentProps) => <a className="underline text-sky-800 hover:text-sky-600" {...props} />
	};

	if (typeof children !== 'string') return (
		<> string not found! </>
	);

	return (
		<div {...props}>
			<ReactMarkdown
				components={components}
				remarkPlugins={[remarkMath, ...remarkPlugins]}
				rehypePlugins={[rehypeKatex, ...rehypePlugins]}
			>
				{children}
			</ReactMarkdown>
		</div>
	);
}