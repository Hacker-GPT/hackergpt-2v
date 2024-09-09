import React, { FC, useMemo } from "react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeMathjax from "rehype-mathjax"
import { MessageCodeBlock } from "./message-codeblock"
import { MessageMarkdownMemoized } from "./message-markdown-memoized"
import { defaultUrlTransform } from "react-markdown"
import { ImageWithPreview } from "@/components/image/image-with-preview"
import { Table, Th, Td } from "@/components/ui/table-components"
import { MessageTerminalBlock } from "./e2b-messages/message-terminal-block"

interface MessageMarkdownProps {
  content: string
  isAssistant: boolean
}

function urlTransform(url: string) {
  if (url.startsWith("data:")) {
    return url
  }
  return defaultUrlTransform(url)
}

export const MessageMarkdown: FC<MessageMarkdownProps> = ({
  content,
  isAssistant
}) => {
  // const processedContent = useMemo(() => {
  //   return content
  //     .replace(/<ai_generated_image>.*?<\/ai_generated_image>/gs, "")
  //     .trim()
  // }, [content])

  if (!isAssistant) {
    return (
      <div className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 w-full max-w-full justify-end break-words sm:w-auto">
        <p className="bg-secondary mb-2 inline-block max-w-full whitespace-pre-wrap rounded border p-2">
          {content}
        </p>
      </div>
    )
  }

  return (
    <MessageMarkdownMemoized
      className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 w-[80vw] min-w-full space-y-6 break-words md:w-full"
      remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: false }]]}
      rehypePlugins={[rehypeMathjax]}
      urlTransform={urlTransform}
      components={{
        a({ children, ...props }) {
          if (typeof children === "string" && /^\d+$/.test(children)) {
            return (
              <a
                {...props}
                title={props.href}
                target={"_blank"}
                className="bg-foreground/20 ml-1 inline-flex size-[16px] items-center justify-center rounded-full text-[10px] no-underline"
              >
                {children}
              </a>
            )
          }
          return <a {...props}>{children}</a>
        },
        p({ children }) {
          return (
            <p className="mb-2 whitespace-pre-wrap last:mb-0">{children}</p>
          )
        },
        img({ node, src, ...props }) {
          return <ImageWithPreview src={src!} alt={props.alt || "image"} />
        },
        table: ({ children, ...props }) => <Table {...props}>{children}</Table>,
        th: ({ children, ...props }) => <Th {...props}>{children}</Th>,
        td: ({ children, ...props }) => <Td {...props}>{children}</Td>,
        code({ node, className, children, ...props }) {
          const childArray = React.Children.toArray(children)
          const firstChild = childArray[0] as React.ReactElement
          const firstChildAsString = React.isValidElement(firstChild)
            ? (firstChild as React.ReactElement).props.children
            : firstChild

          if (firstChildAsString === "▍") {
            return <span className="mt-1 animate-pulse cursor-default">▍</span>
          }

          if (typeof firstChildAsString === "string") {
            childArray[0] = firstChildAsString.replace("`▍`", "▍")
          }

          const match = /language-(\w+)/.exec(className || "")

          if (
            typeof firstChildAsString === "string" &&
            !firstChildAsString.includes("\n")
          ) {
            return (
              <code className={className} {...props}>
                {childArray}
              </code>
            )
          }

          if (match && match[1] === "stdout") {
            return (
              <MessageTerminalBlock
                key={Math.random()}
                value={String(childArray).replace(/\n$/, "")}
              />
            )
          }

          return (
            <MessageCodeBlock
              key={Math.random()}
              language={(match && match[1]) || ""}
              value={String(childArray).replace(/\n$/, "")}
              {...props}
            />
          )
        }
      }}
    >
      {content}
    </MessageMarkdownMemoized>
  )
}
