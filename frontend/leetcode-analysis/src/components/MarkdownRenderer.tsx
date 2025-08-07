import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism } from '@mantine/prism';
import { Text, Title, List, Divider, Blockquote } from '@mantine/core';

interface MarkdownRendererProps {
    content: string;
}

function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            components={{
                h1: ({ children }) => <Title order={1} my="md">{children}</Title>,
                h2: ({ children }) => <Title order={2} my="md">{children}</Title>,
                h3: ({ children }) => <Title order={3} my="md">{children}</Title>,
                h4: ({ children }) => <Title order={4} my="md">{children}</Title>,
                h5: ({ children }) => <Title order={5} my="md">{children}</Title>,
                h6: ({ children }) => <Title order={6} my="md">{children}</Title>,
                p: ({ children }) => <Text my="md">{children}</Text>,
                ul: ({ children }) => <List my="md">{children}</List>,
                ol: ({ children }) => <List type="ordered" my="md">{children}</List>,
                li: ({ children }) => <List.Item>{children}</List.Item>,
                blockquote: ({ children }) => <Blockquote my="md">{children}</Blockquote>,
                hr: () => <Divider my="md" />,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                code: ({ node, inline, className, children, ...props }: { node: any; inline?: boolean; className?: string; children: ReactNode;[key: string]: any }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';


                    return !inline && language ? (
                        //     eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        <Prism colorScheme="dark" language={language} my="md" withLineNumbers>
                            {String(children).replace(/\n$/, '\n')}
                        </Prism>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pre: ({ children }: { children: ReactNode }) => <>{children}</>,
            }}
        >
            {content}
        </ReactMarkdown>
    );
}

export default MarkdownRenderer;