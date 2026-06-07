import { CopyOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
}

function getTextContent(node: unknown): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: unknown } }).props;
    return getTextContent(props?.children);
  }
  return "";
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ className, children, ...props }) {
          const code = String(children).replace(/\n$/, "");
          const isInline = !className;
          if (isInline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
          return (
            <div className="code-block-wrap">
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                className="copy-code-button"
                aria-label="Copy code"
                onClick={() => {
                  void navigator.clipboard.writeText(code);
                  message.success("Code copied");
                }}
              />
              <code className={className} {...props}>
                {children}
              </code>
            </div>
          );
        },
        pre({ children }) {
          return <pre className="markdown-pre">{children}</pre>;
        },
        table({ children }) {
          return <div className="table-wrap"><table>{children}</table></div>;
        },
        a({ children, ...props }) {
          return (
            <a {...props} target="_blank" rel="noreferrer">
              {children}
            </a>
          );
        },
        p({ children }) {
          return <p>{children}</p>;
        },
      }}
    >
      {content || getTextContent(content)}
    </ReactMarkdown>
  );
}
