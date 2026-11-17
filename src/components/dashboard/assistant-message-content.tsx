import type { ReactNode } from "react";
import type { Citation } from "@/types/chat-types";

type MessageBlock =
  | { type: "paragraph"; content: string }
  | { type: "ordered-list"; items: string[] };

interface AssistantMessageContentProps {
  content: string;
  citations?: Citation[];
}

export function parseAssistantMessage(content: string): MessageBlock[] {
  const paragraphs = content
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);

  return paragraphs.flatMap(parseParagraph);
}

function parseParagraph(content: string): MessageBlock[] {
  const markers = Array.from(
    content.matchAll(/(^|\s)(\d{1,2})\.\s+(?=\S)/g),
  ).flatMap((match) => {
    const [fullMatch, prefix, number] = match;
    if (match.index === undefined || prefix === undefined || !number) {
      return [];
    }

    return [
      {
        number: Number(number),
        start: match.index + prefix.length,
        contentStart: match.index + fullMatch.length,
      },
    ];
  });

  const firstMarker = markers[0];
  if (
    !firstMarker ||
    markers.length < 2 ||
    markers.some((marker, index) => marker.number !== index + 1)
  ) {
    return [{ type: "paragraph", content }];
  }

  const blocks: MessageBlock[] = [];
  const introduction = content.slice(0, firstMarker.start).trim();
  if (introduction) {
    blocks.push({ type: "paragraph", content: introduction });
  }

  blocks.push({
    type: "ordered-list",
    items: markers.map((marker, index) =>
      content
        .slice(marker.contentStart, markers[index + 1]?.start ?? content.length)
        .trim(),
    ),
  });

  return blocks;
}

function renderInlineContent(
  content: string,
  citations: Citation[],
): ReactNode {
  return content.split(/(\[\d+\]|\*\*[^*]+\*\*)/g).map((part, index) => {
    const marker = /^\[(\d+)\]$/.exec(part);
    if (marker) {
      const citation = citations.find(
        (item) => item.marker === Number(marker[1]),
      );

      return (
        <sup
          key={index}
          aria-label={
            citation
              ? `Source: ${citation.documentTitle}`
              : `Citation ${marker[1]}`
          }
          className="mx-0.5 inline-flex align-super rounded bg-primary/10 px-1 text-[0.7em] font-semibold leading-5 text-primary"
        >
          {part}
        </sup>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function renderListItem(content: string, citations: Citation[]) {
  const label = /^([^:]{1,90}:)\s*(.*)$/.exec(content);
  const labelText = label?.[1];
  const description = label?.[2];
  if (labelText === undefined || description === undefined) {
    return renderInlineContent(content, citations);
  }

  return (
    <>
      <strong className="font-semibold text-foreground">
        {renderInlineContent(labelText, citations)}
      </strong>{" "}
      {renderInlineContent(description, citations)}
    </>
  );
}

export function AssistantMessageContent({
  content,
  citations = [],
}: AssistantMessageContentProps) {
  const blocks = parseAssistantMessage(content);

  return (
    <div className="space-y-4 text-[15px] leading-7">
      {blocks.map((block, index) =>
        block.type === "paragraph" ? (
          <p key={index}>{renderInlineContent(block.content, citations)}</p>
        ) : (
          <ol
            key={index}
            className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-muted-foreground"
          >
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="pl-1">
                {renderListItem(item, citations)}
              </li>
            ))}
          </ol>
        ),
      )}
    </div>
  );
}
