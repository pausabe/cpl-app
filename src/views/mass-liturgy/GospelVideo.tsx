import React, { useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useTheme } from '../../theme';
import * as Logger from '../../utils/logger';

// The Gospel in sign language, over the text, when it is turned on in Configuració. As wide as
// the column of the text (it used to be the width of the screen, wider than the column), 16:9,
// with the corners of the cards. While it loads, the colour of the chips and a wheel, in light
// and in dark.
export default function GospelVideo({ videoId }: { videoId: string }) {
  const theme = useTheme();
  const { colors } = theme;
  const [width, setWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const onLayout = (event: LayoutChangeEvent) => setWidth(Math.round(event.nativeEvent.layout.width));
  const onState = (state: string) => {
    if (state === 'buffering') setLoading(true);
    else if (state === 'ready' || state === 'playing' || state === 'paused') setLoading(false);
  };
  const onError = (error: string) => {
    setLoading(false);
    setFailed(true);
    Logger.LogError(Logger.LogKeys.Screens, 'GospelVideo', new Error(`YouTube: ${error}`));
  };

  return (
    <View
      testID="gospel-video"
      onLayout={onLayout}
      style={[
        styles.frame,
        { borderRadius: theme.radius.tile, borderColor: colors.border, backgroundColor: colors.chipBackground },
      ]}
    >
      {width > 0 ? (
        <YoutubePlayer
          width={width}
          height={Math.round((width * 9) / 16)}
          play={false}
          videoId={videoId}
          onReady={() => setLoading(false)}
          onChangeState={onState}
          onError={onError}
        />
      ) : null}
      {loading || failed ? (
        <View style={[StyleSheet.absoluteFill, styles.cover, { backgroundColor: colors.chipBackground }]}>
          {failed ? (
            <Text style={[styles.error, { color: colors.text2 }]}>No s’ha pogut carregar el vídeo.</Text>
          ) : (
            <ActivityIndicator
              size="large"
              color={colors.text3}
              accessibilityLabel="S’està carregant el vídeo de l’Evangeli en llengua de signes"
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cover: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  error: {
    fontSize: 15,
    textAlign: 'center',
  },
});
