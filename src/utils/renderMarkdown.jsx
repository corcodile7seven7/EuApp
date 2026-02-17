/**
 * Lightweight markdown renderer for quiz explanations.
 * Supports: **bold**, *italic*, - list items, \n\n paragraphs.
 * Returns React elements with Tailwind classes.
 */

function parseInline(text) {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic: *text* (but not **)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    let firstMatch = null;
    let matchType = null;

    if (boldMatch && (!italicMatch || boldMatch.index <= italicMatch.index)) {
      firstMatch = boldMatch;
      matchType = 'bold';
    } else if (italicMatch) {
      firstMatch = italicMatch;
      matchType = 'italic';
    }

    if (!firstMatch) {
      parts.push(remaining);
      break;
    }

    if (firstMatch.index > 0) {
      parts.push(remaining.slice(0, firstMatch.index));
    }

    if (matchType === 'bold') {
      parts.push(<strong key={key++} className="font-bold">{firstMatch[1]}</strong>);
    } else {
      parts.push(<em key={key++} className="italic">{firstMatch[1]}</em>);
    }

    remaining = remaining.slice(firstMatch.index + firstMatch[0].length);
  }

  return parts;
}

export default function renderMarkdown(text) {
  if (!text) return null;

  // Split into paragraphs by double newline
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-2 leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Check if paragraph is a list (lines starting with -)
        const lines = trimmed.split('\n');
        const isAllList = lines.every(l => l.trim().startsWith('- '));

        if (isAllList) {
          return (
            <ul key={pIdx} className="list-disc ml-4 space-y-1">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="text-sm">
                  {parseInline(line.trim().replace(/^- /, ''))}
                </li>
              ))}
            </ul>
          );
        }

        // Mixed content: some lines may be list items
        const hasListItems = lines.some(l => l.trim().startsWith('- '));
        if (hasListItems) {
          const groups = [];
          let currentGroup = { type: null, items: [] };

          lines.forEach(line => {
            const isList = line.trim().startsWith('- ');
            const type = isList ? 'list' : 'text';
            if (type !== currentGroup.type) {
              if (currentGroup.items.length > 0) groups.push(currentGroup);
              currentGroup = { type, items: [] };
            }
            currentGroup.items.push(line);
          });
          if (currentGroup.items.length > 0) groups.push(currentGroup);

          return (
            <div key={pIdx}>
              {groups.map((group, gIdx) => {
                if (group.type === 'list') {
                  return (
                    <ul key={gIdx} className="list-disc ml-4 space-y-1">
                      {group.items.map((line, lIdx) => (
                        <li key={lIdx} className="text-sm">
                          {parseInline(line.trim().replace(/^- /, ''))}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return group.items.map((line, lIdx) => (
                  <p key={`${gIdx}-${lIdx}`} className="text-sm mb-1">
                    {parseInline(line)}
                  </p>
                ));
              })}
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={pIdx} className="text-sm">
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
