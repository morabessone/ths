import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import YoutubeIframe, { type YoutubeIframeRef } from 'react-native-youtube-iframe';
import { Skeleton } from '@/components/ui/Skeleton';

interface VideoPlayerProps {
  youtubeId: string;
  height: number;
  onEnded?: () => void;
  onPlayStart?: () => void;
}

export function VideoPlayer({ youtubeId, height, onEnded, onPlayStart }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [hasReportedPlay, setHasReportedPlay] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setConnected(state.isConnected ?? false);
    });
    NetInfo.fetch().then((state) => setConnected(state.isConnected ?? false));
    return () => unsub();
  }, []);

  const onStateChange = useCallback(
    (state: string) => {
      if (state === 'playing') {
        setPlaying(true);
        if (!hasReportedPlay) {
          setHasReportedPlay(true);
          onPlayStart?.();
        }
      }
      if (state === 'paused' || state === 'ended') {
        setPlaying(false);
      }
      if (state === 'ended') {
        onEnded?.();
      }
    },
    [hasReportedPlay, onEnded, onPlayStart]
  );

  if (connected === false) {
    return (
      <View
        className="bg-black items-center justify-center"
        style={{ width: '100%', height }}
      >
        <Text className="font-sans text-white text-center px-6">
          Sin conexión · Conectate a internet para reproducir el video
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-black" style={{ width: '100%', height }}>
      {!ready ? <Skeleton className="absolute inset-0 rounded-none" style={{ height }} /> : null}
      <YoutubeIframe
        height={height}
        play={playing}
        videoId={youtubeId}
        onReady={() => setReady(true)}
        onChange={onStateChange}
        webViewProps={{
          androidLayerType: 'hardware',
        }}
      />
    </View>
  );
}
