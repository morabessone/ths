import { useWindowDimensions } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface PlanMarkdownProps {
  content: string;
}

export function PlanMarkdown({ content }: PlanMarkdownProps) {
  const { width } = useWindowDimensions();

  return (
    <Markdown
      style={{
        body: { fontFamily: 'DMSans_400Regular', fontSize: 16, color: '#1A1A2E', width: width - 48 },
        heading2: { fontFamily: 'Fraunces_600SemiBold', fontSize: 22, marginTop: 16, marginBottom: 8 },
        strong: { fontFamily: 'DMSans_600SemiBold' },
        blockquote: {
          backgroundColor: '#F0EEFF',
          borderLeftColor: '#5B4FCF',
          borderLeftWidth: 4,
          paddingLeft: 12,
          paddingVertical: 8,
        },
      }}
    >
      {content}
    </Markdown>
  );
}
